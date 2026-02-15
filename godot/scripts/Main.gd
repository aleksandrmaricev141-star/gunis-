extends Control

const GameState = preload("res://scripts/core/GameState.gd")
const MapCanvas = preload("res://scripts/ui/MapCanvas.gd")

var state := GameState.new()
var border: Array = []

var header_label: Label
var details: RichTextLabel
var metrics: Label
var log_box: RichTextLabel
var map_canvas: MapCanvas
var mode_option: OptionButton
var hovered_id: String = ""
var pause_btn: Button

var start_menu: PanelContainer
var district_picker: OptionButton

func _ready() -> void:
	_load_data()
	_build_ui()
	_refresh()
	_show_start_menu()

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
	right.custom_minimum_size = Vector2(560, 900)
	root.add_child(right)

	details = RichTextLabel.new()
	details.custom_minimum_size = Vector2(560, 360)
	right.add_child(details)

	var actions := HBoxContainer.new()
	right.add_child(actions)

	var crisis_btn := Button.new()
	crisis_btn.text = "Антикризисная команда"
	crisis_btn.pressed.connect(_on_crisis)
	actions.add_child(crisis_btn)

	var eco_btn := Button.new()
	eco_btn.text = "Экономический штаб"
	eco_btn.pressed.connect(_on_eco)
	actions.add_child(eco_btn)

	metrics = Label.new()
	metrics.custom_minimum_size = Vector2(560, 80)
	right.add_child(metrics)

	log_box = RichTextLabel.new()
	log_box.custom_minimum_size = Vector2(560, 390)
	right.add_child(log_box)

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
	hint.text = "Выберите район, за который начинаете карьеру"
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
	var d := state.selected_district()
	var pd := state.player_district()
	header_label.text = "Godot-only | Старт 2020 | Месяц %02d Год %d | Игрок: %s | BUD %.1f POL %.1f CAD %.0f EXP %.1f MED %.1f" % [
		state.month, state.year, pd["name"], state.resources["BUD"], state.resources["POL"], state.resources["CAD"], state.resources["EXP"], state.resources["MED"]
	]
	pause_btn.text = "Пауза: ON" if state.is_paused else "Пауза: OFF"

	var hover_label: String = hovered_id if hovered_id != "" else "—"
	var player_mark: String = "ДА" if String(d["id"]) == state.player_district_id else "нет"
	var budget: Dictionary = d["budget"]
	details.text = "[b]%s[/b] (%s)\nИгровой район: %s\nPOP %sk | INF %.1f | ECO %.1f | LOY %.1f | SERV %.1f | RISK %.1f | LOG %.2f\nБюджет: infra %s / social %s / business %s / apk %s / housing %s / reserve %s\nНаведение: %s\n\n[code]Формулы[/code]\nΔBUD = TaxBase × (0.12 + ECO/500) + Transfers - DebtService - Leakage\nCS = 0.35×EfficiencyIndex + 0.25×LoyaltyIndex + 0.20×CrisisScore + 0.20×FederalTrust\n\nКлик по карте выбирает район/город." % [
		d["name"], d["type"], player_mark, d["POP"], d["INF"], d["ECO"], d["LOY"], d["SERV"], d["RISK"], d["LOG"], budget["infra"], budget["social"], budget["business"], budget["apk"], budget["housing"], budget["reserve"], hover_label
	]

	var rdi := state.weighted_rdi()
	var victory := state.rank == "Губернатор" and rdi >= 75.0 and state.support_score >= 60.0
	metrics.text = "CS %.1f | SUP %.1f | RDI %.1f\nДолжность: %s\nПобеда: %s" % [state.career_score, state.support_score, rdi, state.rank, ("Да" if victory else "Нет")]

	var lines := PackedStringArray()
	for i in range(state.logs.size() - 1, max(state.logs.size() - 28, 0), -1):
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
	state.set_selected_by_id(id)
	_refresh()

func _on_crisis() -> void:
	state.deploy_crisis_team()
	_refresh()

func _on_eco() -> void:
	state.deploy_eco_team()
	_refresh()

func _on_district_hovered(id: String) -> void:
	hovered_id = id
	_refresh()
