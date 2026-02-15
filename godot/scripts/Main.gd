extends Control

const GameState = preload("res://scripts/core/GameState.gd")
const MapCanvas = preload("res://scripts/ui/MapCanvas.gd")

var state := GameState.new()
var border: Array = []

var header_label: Label
var district_info: RichTextLabel
var metrics: Label
var log_box: RichTextLabel
var map_canvas: MapCanvas
var mode_option: OptionButton
var hovered_id: String = ""
var pause_btn: Button

var tab_container: TabContainer
var tab_politics: RichTextLabel
var tab_infra: RichTextLabel
var tab_economy: RichTextLabel
var tab_social: RichTextLabel
var tab_security: RichTextLabel

var start_menu: PanelContainer
var district_picker: OptionButton

func _ready() -> void:
	_load_data()
	_build_ui()
	_refresh()
	_show_start_menu()

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_ESCAPE:
		state.toggle_pause()
		_refresh()

func _load_data() -> void:
	var f := FileAccess.open("res://data/districts.json", FileAccess.READ)
	var parsed = JSON.parse_string(f.get_as_text())
	border = parsed["border"]
	state.setup(parsed["districts"])

func _build_ui() -> void:
	var root := HSplitContainer.new()
	root.anchor_right = 1.0
	root.anchor_bottom = 1.0
	root.offset_left = 10
	root.offset_top = 10
	root.offset_right = -10
	root.offset_bottom = -10
	add_child(root)

	var left := VBoxContainer.new()
	left.custom_minimum_size = Vector2(980, 900)
	root.add_child(left)

	var top := HBoxContainer.new()
	left.add_child(top)

	header_label = Label.new()
	header_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top.add_child(header_label)

	var next_btn := Button.new()
	next_btn.text = "Следующий месяц"
	next_btn.pressed.connect(_on_next_month)
	top.add_child(next_btn)

	var next3_btn := Button.new()
	next3_btn.text = "+3 месяца"
	next3_btn.pressed.connect(_on_next_3)
	top.add_child(next3_btn)

	pause_btn = Button.new()
	pause_btn.text = "Пауза"
	pause_btn.pressed.connect(_on_pause_toggle)
	top.add_child(pause_btn)

	mode_option = OptionButton.new()
	for k in ["LOY", "INF", "ECO", "RISK", "SERV"]:
		mode_option.add_item(k)
	mode_option.item_selected.connect(_on_mode_selected)
	top.add_child(mode_option)

	map_canvas = MapCanvas.new()
	map_canvas.custom_minimum_size = Vector2(980, 820)
	map_canvas.district_clicked.connect(_on_district_clicked)
	map_canvas.district_hovered.connect(_on_district_hovered)
	left.add_child(map_canvas)

	var right := VBoxContainer.new()
	right.custom_minimum_size = Vector2(590, 900)
	root.add_child(right)

	district_info = RichTextLabel.new()
	district_info.custom_minimum_size = Vector2(590, 220)
	right.add_child(district_info)

	var actions := HBoxContainer.new()
	right.add_child(actions)

	var crisis_btn := Button.new()
	crisis_btn.text = "Антикризис"
	crisis_btn.pressed.connect(_on_crisis)
	actions.add_child(crisis_btn)

	var eco_btn := Button.new()
	eco_btn.text = "Экоштаб"
	eco_btn.pressed.connect(_on_eco)
	actions.add_child(eco_btn)

	var loan_btn := Button.new()
	loan_btn.text = "Займ +200"
	loan_btn.pressed.connect(_on_loan)
	actions.add_child(loan_btn)

	var tender_btn := Button.new()
	tender_btn.text = "Иностр. тендер"
	tender_btn.pressed.connect(_on_tender)
	actions.add_child(tender_btn)

	metrics = Label.new()
	metrics.custom_minimum_size = Vector2(590, 70)
	right.add_child(metrics)

	tab_container = TabContainer.new()
	tab_container.custom_minimum_size = Vector2(590, 230)
	right.add_child(tab_container)

	tab_politics = _add_tab("Политика")
	tab_infra = _add_tab("Инфраструктура")
	tab_economy = _add_tab("Экономика")
	tab_social = _add_tab("Социальная сфера")
	tab_security = _add_tab("Безопасность")

	log_box = RichTextLabel.new()
	log_box.custom_minimum_size = Vector2(590, 260)
	right.add_child(log_box)

func _add_tab(name: String) -> RichTextLabel:
	var box := RichTextLabel.new()
	box.name = name
	box.fit_content = true
	tab_container.add_child(box)
	tab_container.set_tab_title(tab_container.get_tab_count() - 1, name)
	return box

func _show_start_menu() -> void:
	start_menu = PanelContainer.new()
	start_menu.anchor_right = 1.0
	start_menu.anchor_bottom = 1.0
	start_menu.offset_left = 360
	start_menu.offset_top = 220
	start_menu.offset_right = -360
	start_menu.offset_bottom = -220
	add_child(start_menu)

	var vb := VBoxContainer.new()
	start_menu.add_child(vb)

	var title := Label.new()
	title.text = "Старт кампании (2020)"
	vb.add_child(title)

	var hint := Label.new()
	hint.text = "Выберите район, за который вы играете"
	vb.add_child(hint)

	district_picker = OptionButton.new()
	for d in state.districts:
		district_picker.add_item(String(d["name"]))
	vb.add_child(district_picker)

	var start_btn := Button.new()
	start_btn.text = "Начать игру"
	start_btn.pressed.connect(_on_start_game)
	vb.add_child(start_btn)

func _on_start_game() -> void:
	var idx: int = district_picker.selected
	if idx < 0 or idx >= state.districts.size():
		idx = 0
	var d: Dictionary = state.districts[idx]
	state.set_player_district(String(d["id"]))
	start_menu.visible = false
	_refresh()

func _refresh() -> void:
	var d: Dictionary = state.selected_district()
	var pd: Dictionary = state.player_district()
	header_label.text = "HOI4-style UI | %02d.%d | Роль: %s | Игрок: %s | BUD %.1f POL %.1f CAD %.0f EXP %.1f MED %.1f Debt %.1f" % [
		state.month, state.year, state.rank, pd["name"], state.resources["BUD"], state.resources["POL"], state.resources["CAD"], state.resources["EXP"], state.resources["MED"], state.resources["debt"]
	]
	pause_btn.text = "Пауза [ESC]: ON" if state.is_paused else "Пауза [ESC]: OFF"

	var hover_label: String = hovered_id if hovered_id != "" else "—"
	var player_mark: String = "ДА" if String(d["id"]) == state.player_district_id else "нет"
	var budget: Dictionary = d["budget"]
	district_info.text = "[b]%s[/b] (%s)\nИгровой район: %s\nНаселение: %sk\nБюджет района: %.1f\nПоддержка народа: %.1f\nNPS: %.1f\nINF %.1f | ECO %.1f | LOY %.1f | SERV %.1f | RISK %.1f\nБюджет-сплит: infra %s / social %s / business %s / apk %s / housing %s / reserve %s\nНаведение: %s" % [
		d["name"], d["type"], player_mark, d["POP"], d["DIST_BUD"], d["SUP"], d["NPS"], d["INF"], d["ECO"], d["LOY"], d["SERV"], d["RISK"], budget["infra"], budget["social"], budget["business"], budget["apk"], budget["housing"], budget["reserve"], hover_label
	]

	metrics.text = "CS %.1f | SUP %.1f | RDI %.1f\nКарьера: Глава района → Глава фаланги → Мэр Орла+фаланга → Губернатор" % [state.career_score, state.support_score, state.weighted_rdi()]

	tab_politics.text = "• Политический капитал: %.1f\n• Поддержка населения: %.1f\n• Карьерный уровень: %s" % [state.resources["POL"], d["SUP"], state.rank]
	tab_infra.text = "• INF: %.1f\n• Иностранный тендер улучшает INF/ECO\n• LOG: %.2f" % [d["INF"], d["LOG"]]
	tab_economy.text = "• ECO: %.1f\n• Районный бюджет: %.1f\n• Банк: долг %.1f под %.1f%%" % [d["ECO"], d["DIST_BUD"], state.resources["debt"], float(state.resources["debt_rate"]) * 100.0]
	tab_social.text = "• Население: %sk\n• SERV: %.1f\n• LOY: %.1f\n• SUP: %.1f\n• NPS: %.1f" % [d["POP"], d["SERV"], d["LOY"], d["SUP"], d["NPS"]]
	tab_security.text = "• RISK: %.1f\n• Антикризисные меры снижают риск\n• Внеигровые районы развивают NPS сами" % [d["RISK"]]

	var lines := PackedStringArray()
	for i in range(state.logs.size() - 1, max(state.logs.size() - 22, 0), -1):
		lines.append(state.logs[i])
	log_box.text = "\n".join(lines)

	map_canvas.configure(border, state.districts, state.selected_id, state.map_mode, state.district_colors)

func _on_pause_toggle() -> void:
	state.toggle_pause()
	_refresh()

func _on_next_month() -> void:
	state.process_month()
	_refresh()

func _on_next_3() -> void:
	for _i in range(3):
		state.process_month()
	_refresh()

func _on_mode_selected(index: int) -> void:
	state.map_mode = mode_option.get_item_text(index)
	_refresh()

func _on_district_clicked(id: String) -> void:
	if not state.can_play_as(id):
		state.add_log("Нельзя переключиться и играть за другой район после старта")
		_refresh()
		return
	state.set_selected_by_id(id)
	_refresh()

func _on_crisis() -> void:
	state.deploy_crisis_team()
	_refresh()

func _on_eco() -> void:
	state.deploy_eco_team()
	_refresh()

func _on_loan() -> void:
	state.take_loan(200.0, 0.12)
	_refresh()

func _on_tender() -> void:
	state.launch_foreign_tender()
	_refresh()

func _on_district_hovered(id: String) -> void:
	hovered_id = id
	_refresh()
