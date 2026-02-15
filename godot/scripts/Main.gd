extends Control

const BORDER_POINTS := [
	Vector2(35.00, 53.25), Vector2(35.20, 53.45), Vector2(35.55, 53.55), Vector2(36.05, 53.52),
	Vector2(36.45, 53.45), Vector2(36.95, 53.38), Vector2(37.35, 53.22), Vector2(37.75, 53.02),
	Vector2(37.88, 52.75), Vector2(37.80, 52.48), Vector2(37.58, 52.18), Vector2(37.22, 52.02),
	Vector2(36.85, 51.98), Vector2(36.45, 52.00), Vector2(36.00, 52.05), Vector2(35.60, 52.08),
	Vector2(35.25, 52.22), Vector2(35.00, 52.45), Vector2(34.95, 52.75), Vector2(35.00, 53.00)
]

const DISTRICTS_TEMPLATE := [
	{"id":"orel_city","name":"Орёл","type":"Город","lat":52.97,"lon":36.07,"POP":310,"INF":72,"ECO":74,"LOY":56,"SERV":63,"RISK":37,"LOG":1.2},
	{"id":"livny_city","name":"Ливны","type":"Город","lat":52.43,"lon":37.60,"POP":47,"INF":58,"ECO":55,"LOY":52,"SERV":54,"RISK":42,"LOG":1.05},
	{"id":"mtsensk_city","name":"Мценск","type":"Город","lat":53.28,"lon":36.57,"POP":37,"INF":60,"ECO":57,"LOY":50,"SERV":51,"RISK":40,"LOG":1.08},
	{"id":"bolkhov","name":"Болховский","type":"Район","lat":53.44,"lon":36.00,"POP":22,"INF":46,"ECO":43,"LOY":51,"SERV":45,"RISK":47,"LOG":0.93},
	{"id":"verkhovsky","name":"Верховский","type":"Район","lat":52.81,"lon":37.24,"POP":17,"INF":43,"ECO":40,"LOY":47,"SERV":43,"RISK":52,"LOG":0.88},
	{"id":"glazunovsky","name":"Глазуновский","type":"Район","lat":52.50,"lon":36.33,"POP":16,"INF":44,"ECO":42,"LOY":49,"SERV":45,"RISK":48,"LOG":0.92},
	{"id":"dmitrovsky","name":"Дмитровский","type":"Район","lat":52.50,"lon":35.15,"POP":15,"INF":44,"ECO":42,"LOY":49,"SERV":46,"RISK":48,"LOG":0.91},
	{"id":"dolzhansky","name":"Должанский","type":"Район","lat":52.06,"lon":37.33,"POP":13,"INF":41,"ECO":39,"LOY":46,"SERV":42,"RISK":53,"LOG":0.86},
	{"id":"zalegoshchensky","name":"Залегощенский","type":"Район","lat":52.90,"lon":36.89,"POP":14,"INF":45,"ECO":43,"LOY":50,"SERV":46,"RISK":47,"LOG":0.95},
	{"id":"znamensky","name":"Знаменский","type":"Район","lat":52.88,"lon":35.90,"POP":10,"INF":40,"ECO":38,"LOY":48,"SERV":42,"RISK":52,"LOG":0.87},
	{"id":"kolpnyansky","name":"Колпнянский","type":"Район","lat":52.23,"lon":37.04,"POP":12,"INF":41,"ECO":40,"LOY":47,"SERV":43,"RISK":51,"LOG":0.88},
	{"id":"korsakovsky","name":"Корсаковский","type":"Район","lat":52.83,"lon":37.72,"POP":9,"INF":39,"ECO":37,"LOY":46,"SERV":41,"RISK":54,"LOG":0.84},
	{"id":"krasnozorensky","name":"Краснозоренский","type":"Район","lat":52.77,"lon":37.67,"POP":9,"INF":39,"ECO":38,"LOY":46,"SERV":41,"RISK":53,"LOG":0.84},
	{"id":"kromskoy","name":"Кромской","type":"Район","lat":52.69,"lon":35.77,"POP":16,"INF":45,"ECO":44,"LOY":51,"SERV":47,"RISK":45,"LOG":0.99},
	{"id":"livensky","name":"Ливенский","type":"Район","lat":52.48,"lon":37.55,"POP":24,"INF":50,"ECO":47,"LOY":52,"SERV":49,"RISK":44,"LOG":1.01},
	{"id":"maloarkhangelsky","name":"Малоархангельский","type":"Район","lat":52.40,"lon":36.50,"POP":11,"INF":40,"ECO":39,"LOY":48,"SERV":43,"RISK":51,"LOG":0.89},
	{"id":"mtsensky","name":"Мценский","type":"Район","lat":53.20,"lon":36.45,"POP":25,"INF":52,"ECO":50,"LOY":53,"SERV":50,"RISK":43,"LOG":1.03},
	{"id":"novoderevenkovsky","name":"Новодеревеньковский","type":"Район","lat":52.79,"lon":37.65,"POP":16,"INF":42,"ECO":41,"LOY":48,"SERV":44,"RISK":50,"LOG":0.90},
	{"id":"novosilsky","name":"Новосильский","type":"Район","lat":52.97,"lon":37.04,"POP":10,"INF":40,"ECO":39,"LOY":47,"SERV":42,"RISK":52,"LOG":0.87},
	{"id":"orlovsky","name":"Орловский","type":"Район","lat":52.94,"lon":36.20,"POP":42,"INF":58,"ECO":57,"LOY":54,"SERV":55,"RISK":41,"LOG":1.08},
	{"id":"pokrovsky","name":"Покровский","type":"Район","lat":52.61,"lon":36.98,"POP":20,"INF":47,"ECO":45,"LOY":52,"SERV":47,"RISK":45,"LOG":0.98},
	{"id":"sverdlovsky","name":"Свердловский","type":"Район","lat":52.67,"lon":36.42,"POP":19,"INF":45,"ECO":44,"LOY":50,"SERV":46,"RISK":46,"LOG":0.95},
	{"id":"soskovsky","name":"Сосковский","type":"Район","lat":53.36,"lon":35.38,"POP":8,"INF":38,"ECO":36,"LOY":45,"SERV":40,"RISK":55,"LOG":0.82},
	{"id":"trosnyansky","name":"Троснянский","type":"Район","lat":52.53,"lon":35.82,"POP":11,"INF":41,"ECO":39,"LOY":47,"SERV":42,"RISK":52,"LOG":0.86},
	{"id":"uritsky","name":"Урицкий","type":"Район","lat":52.97,"lon":35.73,"POP":17,"INF":44,"ECO":43,"LOY":49,"SERV":45,"RISK":48,"LOG":0.92},
	{"id":"khotynetsky","name":"Хотынецкий","type":"Район","lat":53.13,"lon":35.39,"POP":10,"INF":40,"ECO":38,"LOY":47,"SERV":42,"RISK":52,"LOG":0.85},
	{"id":"shablykinsky","name":"Шаблыкинский","type":"Район","lat":52.86,"lon":35.20,"POP":9,"INF":39,"ECO":37,"LOY":46,"SERV":41,"RISK":54,"LOG":0.84}
]

var state := {
	"month": 1,
	"year": 1,
	"resources": {"BUD":1200.0, "POL":120.0, "CAD":24.0, "EXP":35.0, "MED":28.0, "debt":180.0},
	"career_score": 52.0,
	"support": 54.0,
	"rank": "Глава района",
	"selected_id": "orel_city",
	"districts": [],
	"logs": ["[Г1 М1] Инициализация Godot-проекта: все районы Орловской области загружены."],
	"focus_active": false,
	"focus_days": 0.0,
	"focus_name": "",
	"map_mode": "LOY"
}

var top_label: Label
var detail_label: RichTextLabel
var metrics_label: Label
var log_label: RichTextLabel
var mode_option: OptionButton

var map_rect := Rect2(20, 90, 980, 820)

func _ready() -> void:
	for d in DISTRICTS_TEMPLATE:
		var copy := d.duplicate(true)
		copy["budget"] = {"infra":35, "social":10, "business":10, "apk":15, "housing":20, "reserve":10}
		state["districts"].append(copy)
	build_ui()
	update_ui()

func build_ui() -> void:
	var bg := ColorRect.new()
	bg.color = Color("#0b1220")
	bg.anchor_right = 1.0
	bg.anchor_bottom = 1.0
	add_child(bg)

	var header := HBoxContainer.new()
	header.position = Vector2(20, 12)
	header.size = Vector2(1560, 40)
	add_child(header)

	top_label = Label.new()
	top_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header.add_child(top_label)

	var next_btn := Button.new()
	next_btn.text = "Следующий месяц"
	next_btn.pressed.connect(_on_next_month)
	header.add_child(next_btn)

	var next3_btn := Button.new()
	next3_btn.text = "+3 месяца"
	next3_btn.pressed.connect(_on_next_3_month)
	header.add_child(next3_btn)

	mode_option = OptionButton.new()
	for key in ["LOY", "INF", "ECO", "RISK", "SERV"]:
		mode_option.add_item(key)
	mode_option.item_selected.connect(_on_mode_selected)
	header.add_child(mode_option)

	var right_panel := PanelContainer.new()
	right_panel.position = Vector2(1020, 90)
	right_panel.size = Vector2(560, 820)
	add_child(right_panel)

	var right_vbox := VBoxContainer.new()
	right_panel.add_child(right_vbox)

	detail_label = RichTextLabel.new()
	detail_label.fit_content = true
	detail_label.custom_minimum_size = Vector2(540, 250)
	right_vbox.add_child(detail_label)

	metrics_label = Label.new()
	metrics_label.custom_minimum_size = Vector2(540, 120)
	right_vbox.add_child(metrics_label)

	var btns := HBoxContainer.new()
	right_vbox.add_child(btns)

	var crisis_btn := Button.new()
	crisis_btn.text = "Антикризисная команда"
	crisis_btn.pressed.connect(_on_deploy_crisis)
	btns.add_child(crisis_btn)

	var eco_btn := Button.new()
	eco_btn.text = "Экономический штаб"
	eco_btn.pressed.connect(_on_deploy_eco)
	btns.add_child(eco_btn)

	var focus_btn := Button.new()
	focus_btn.text = "Запустить фокус (35д)"
	focus_btn.pressed.connect(_on_start_focus)
	right_vbox.add_child(focus_btn)

	log_label = RichTextLabel.new()
	log_label.custom_minimum_size = Vector2(540, 360)
	right_vbox.add_child(log_label)

func _draw() -> void:
	draw_rect(map_rect, Color("#111827"), true)
	_draw_outline()
	_draw_district_points()
	draw_string(get_theme_default_font(), map_rect.position + Vector2(12, 18), "Реальная гео-основа: контур Орловской области + координаты центров районов", HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color.WHITE)

func _draw_outline() -> void:
	var pts := PackedVector2Array()
	for p in BORDER_POINTS:
		pts.append(_project_geo(p.y, p.x))
	draw_colored_polygon(pts, Color(0.12, 0.35, 0.22, 0.45))
	for i in range(pts.size()):
		draw_line(pts[i], pts[(i + 1) % pts.size()], Color(0.5, 0.9, 0.65), 2.0)

func _draw_district_points() -> void:
	for d in state["districts"]:
		var p := _project_geo(d["lat"], d["lon"])
		var value := d[state["map_mode"]]
		var col := _value_color(value, state["map_mode"])
		var radius := 8.0 if d["id"] == state["selected_id"] else 5.0
		draw_circle(p, radius, col)
		if d["id"] == state["selected_id"]:
			draw_string(get_theme_default_font(), p + Vector2(10, -8), d["name"], HORIZONTAL_ALIGNMENT_LEFT, -1, 13, Color.WHITE)

func _project_geo(lat: float, lon: float) -> Vector2:
	var min_lon := 34.9
	var max_lon := 37.9
	var min_lat := 51.95
	var max_lat := 53.6
	var x := map_rect.position.x + ((lon - min_lon) / (max_lon - min_lon)) * map_rect.size.x
	var y := map_rect.position.y + (1.0 - (lat - min_lat) / (max_lat - min_lat)) * map_rect.size.y
	return Vector2(x, y)

func _value_color(value: float, mode: String) -> Color:
	var norm := clamp((100.0 - value) if mode == "RISK" else value, 0.0, 100.0) / 100.0
	return Color(1.0 - norm, 0.2 + norm * 0.7, 0.25)

func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		var pos := event.position
		if map_rect.has_point(pos):
			_select_nearest(pos)

func _select_nearest(pos: Vector2) -> void:
	var best_dist := 999999.0
	var best_id := state["selected_id"]
	for d in state["districts"]:
		var p := _project_geo(d["lat"], d["lon"])
		var dd := p.distance_to(pos)
		if dd < best_dist:
			best_dist = dd
			best_id = d["id"]
	if best_dist <= 24.0:
		state["selected_id"] = best_id
		update_ui()

func _on_mode_selected(index: int) -> void:
	state["map_mode"] = mode_option.get_item_text(index)
	queue_redraw()

func _on_next_month() -> void:
	_process_month()
	update_ui()

func _on_next_3_month() -> void:
	for i in range(3):
		_process_month()
	update_ui()

func _on_start_focus() -> void:
	if state["focus_active"]:
		_add_log("Фокус уже выполняется.")
	else:
		state["focus_active"] = true
		state["focus_days"] = 0.0
		state["focus_name"] = "Проектный офис района"
		_add_log("Запущен фокус: Проектный офис района")
	update_ui()

func _on_deploy_crisis() -> void:
	if state["resources"]["CAD"] < 2:
		_add_log("Недостаточно CAD для антикризисной команды")
	else:
		state["resources"]["CAD"] -= 2
		for d in state["districts"]:
			d["RISK"] = clamp(d["RISK"] - 1.0, 0.0, 100.0)
		_add_log("Развернута антикризисная команда: RISK в районах снижён")
	update_ui()

func _on_deploy_eco() -> void:
	if state["resources"]["CAD"] < 2:
		_add_log("Недостаточно CAD для экономического штаба")
	else:
		state["resources"]["CAD"] -= 2
		for d in state["districts"]:
			d["INF"] = clamp(d["INF"] + 0.6, 0.0, 100.0)
		_add_log("Развернут экономический штаб: INF ускоренно растёт")
	update_ui()

func _process_month() -> void:
	if state["focus_active"]:
		state["focus_days"] += 30.0
		if state["focus_days"] >= 35.0:
			state["focus_active"] = false
			for d in state["districts"]:
				d["INF"] = clamp(d["INF"] + 0.8, 0.0, 100.0)
			_add_log("Фокус завершён: +INF по области")

	for d in state["districts"]:
		var b = d["budget"]
		var inf_next = d["INF"] + 0.6 * (1.0 + (d["LOG"] - 1.0)) * (float(b["infra"]) / 35.0) - clamp(0.35 - float(b["housing"]) / 100.0, 0.1, 0.35)
		d["INF"] = clamp(inf_next, 0.0, 100.0)
		d["ECO"] = clamp(d["ECO"] + 0.25 * d["LOG"] * (1.0 + float(b["business"]) / 100.0) - d["RISK"] / 220.0, 0.0, 100.0)
		d["SERV"] = clamp(d["SERV"] + float(b["social"]) / 120.0 + float(b["housing"]) / 130.0 - d["RISK"] / 160.0, 0.0, 100.0)
		d["LOY"] = clamp(d["LOY"] + 0.15 * ((d["SERV"] - 50.0) / 10.0) + 0.10 * ((d["ECO"] - 50.0) / 10.0) - d["RISK"] / 200.0, 0.0, 100.0)
		d["RISK"] = clamp(d["RISK"] - 0.35 + randf_range(-0.2, 0.5), 0.0, 100.0)

	var avg_eco = _avg("ECO")
	var avg_loy = _avg("LOY")
	var delta_bud = avg_eco * 12.0 * (0.12 + avg_eco / 500.0) + 30.0 - 12.0 - (55.0 / 9.0)
	state["resources"]["BUD"] = clamp(state["resources"]["BUD"] + delta_bud, 0.0, 5000.0)
	state["resources"]["POL"] = clamp(state["resources"]["POL"] + 0.4 * (avg_loy - 50.0) / 10.0, 0.0, 300.0)
	state["resources"]["EXP"] = clamp(state["resources"]["EXP"] + 0.2, 0.0, 300.0)
	state["resources"]["MED"] = clamp(state["resources"]["MED"] + 0.15, 0.0, 120.0)

	if randf() < 0.14:
		var idx = randi() % state["districts"].size()
		state["districts"][idx]["RISK"] = clamp(state["districts"][idx]["RISK"] + 6.0, 0.0, 100.0)
		_add_log("Событие: кризис в %s" % state["districts"][idx]["name"])

	state["month"] += 1
	if state["month"] > 12:
		state["month"] = 1
		state["year"] += 1
		_add_log("Годовой отчёт готов")

	_recompute_scores()
	_add_log("Месяц закрыт: BUD %.1f, POL %.1f, SUP %.1f" % [state["resources"]["BUD"], state["resources"]["POL"], state["support"]])

func _recompute_scores() -> void:
	var rdi = _weighted_rdi()
	var sup = clamp(0.4 * _avg("SERV") + 0.3 * _avg("ECO") + 0.2 * state["resources"]["MED"] + 0.1 * (100.0 - _avg("RISK")), 0.0, 100.0)
	state["support"] = sup
	var crisis_score = 100.0 - _avg("RISK")
	var loyalty_idx = _avg("LOY")
	var federal = clamp(50.0 + (state["resources"]["POL"] - 100.0) / 2.0, 0.0, 100.0)
	state["career_score"] = 0.35 * rdi + 0.25 * loyalty_idx + 0.20 * crisis_score + 0.20 * federal
	if state["career_score"] >= 85.0:
		state["rank"] = "Губернатор"
	elif state["career_score"] >= 75.0:
		state["rank"] = "Вице-губернатор"
	elif state["career_score"] >= 60.0:
		state["rank"] = "Кандидат на повышение"
	else:
		state["rank"] = "Глава района"

func _weighted_rdi() -> float:
	var s := 0.0
	var ws := 0.0
	for d in state["districts"]:
		var rei = 0.30 * d["INF"] + 0.25 * d["ECO"] + 0.20 * d["SERV"] + 0.15 * 70.0 + 0.10 * 55.0
		var w = sqrt(float(d["POP"]))
		s += rei * w
		ws += w
	return s / max(ws, 0.01)

func _avg(key: String) -> float:
	var s := 0.0
	for d in state["districts"]:
		s += d[key]
	return s / state["districts"].size()

func _district_by_id(id: String) -> Dictionary:
	for d in state["districts"]:
		if d["id"] == id:
			return d
	return state["districts"][0]

func _add_log(text: String) -> void:
	state["logs"].append("[Г%s М%s] %s" % [state["year"], state["month"], text])
	if state["logs"].size() > 120:
		state["logs"] = state["logs"].slice(state["logs"].size() - 120, state["logs"].size())

func update_ui() -> void:
	_recompute_scores()
	var d := _district_by_id(state["selected_id"])
	top_label.text = "Вертикаль: Орловская область | %d районов + 3 города | Месяц %d Год %d | BUD %.1f POL %.1f CAD %.0f EXP %.1f MED %.1f" % [
		state["districts"].size() - 3, state["month"], state["year"], state["resources"]["BUD"], state["resources"]["POL"], state["resources"]["CAD"], state["resources"]["EXP"], state["resources"]["MED"]
	]

	detail_label.text = "[b]%s[/b] (%s)\nPOP %sk | INF %.1f | ECO %.1f | LOY %.1f | SERV %.1f | RISK %.1f | LOG %.2f\n\n[code]Формулы[/code]\nΔBUD = TaxBase × (0.12 + ECO/500) + Transfers - DebtService - Leakage\nCS = 0.35×EfficiencyIndex + 0.25×LoyaltyIndex + 0.20×CrisisScore + 0.20×FederalTrust\n\nКлик по точке на карте выбирает район/город." % [
		d["name"], d["type"], d["POP"], d["INF"], d["ECO"], d["LOY"], d["SERV"], d["RISK"], d["LOG"]
	]

	var rdi = _weighted_rdi()
	var victory := state["rank"] == "Губернатор" and rdi >= 75.0 and state["support"] >= 60.0
	metrics_label.text = "CS %.1f | SUP %.1f | RDI %.1f\nДолжность: %s\nПобеда: %s" % [state["career_score"], state["support"], rdi, state["rank"], ("Да" if victory else "Нет")]

	var log_lines := PackedStringArray()
	for i in range(state["logs"].size() - 1, max(state["logs"].size() - 21, 0), -1):
		log_lines.append(state["logs"][i])
	log_label.text = "\n".join(log_lines)
	queue_redraw()
