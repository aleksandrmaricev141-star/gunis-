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

func _ready() -> void:
	_load_data()
	_build_ui()
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
	details.custom_minimum_size = Vector2(560, 300)
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
	log_box.custom_minimum_size = Vector2(560, 450)
	right.add_child(log_box)

func _refresh() -> void:
	var d := state.selected_district()
	header_label.text = "Godot-only | %d районов + 3 города | Месяц %d Год %d | BUD %.1f POL %.1f CAD %.0f EXP %.1f MED %.1f" % [
		state.districts.size() - 3, state.month, state.year, state.resources["BUD"], state.resources["POL"], state.resources["CAD"], state.resources["EXP"], state.resources["MED"]
	]

	var hover_label: String = hovered_id if hovered_id != "" else "—"
	details.text = "[b]%s[/b] (%s)\nPOP %sk | INF %.1f | ECO %.1f | LOY %.1f | SERV %.1f | RISK %.1f | LOG %.2f\nНаведение: %s\n\n[code]Формулы[/code]\nΔBUD = TaxBase × (0.12 + ECO/500) + Transfers - DebtService - Leakage\nCS = 0.35×EfficiencyIndex + 0.25×LoyaltyIndex + 0.20×CrisisScore + 0.20×FederalTrust\n\nКлик по карте выбирает район/город." % [
				d["name"], d["type"], d["POP"], d["INF"], d["ECO"], d["LOY"], d["SERV"], d["RISK"], d["LOG"], hover_label
	]

	var rdi := state.weighted_rdi()
	var victory := state.rank == "Губернатор" and rdi >= 75.0 and state.support_score >= 60.0
	metrics.text = "CS %.1f | SUP %.1f | RDI %.1f\nДолжность: %s\nПобеда: %s" % [state.career_score, state.support_score, rdi, state.rank, ("Да" if victory else "Нет")]

	var lines := PackedStringArray()
	for i in range(state.logs.size() - 1, max(state.logs.size() - 28, 0), -1):
		lines.append(state.logs[i])
	log_box.text = "\n".join(lines)

	map_canvas.configure(border, state.districts, state.selected_id, state.map_mode)

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
