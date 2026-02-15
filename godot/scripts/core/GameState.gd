extends RefCounted
class_name GameState

var month: int = 1
var year: int = 2020
var rank: String = "Глава района"
var map_mode: String = "LOY"
var is_paused: bool = false

var resources: Dictionary = {"BUD":1200.0, "POL":120.0, "CAD":24.0, "EXP":35.0, "MED":28.0, "debt":180.0, "debt_rate":0.08}
var districts: Array[Dictionary] = []
var selected_id: String = ""
var player_district_id: String = ""
var district_colors: Dictionary = {}
var career_score: float = 52.0
var support_score: float = 54.0
var logs: Array[String] = []

func setup(district_data: Array) -> void:
	districts.clear()
	district_colors.clear()
	for d in district_data:
		var copy: Dictionary = (d as Dictionary).duplicate(true)
		copy["budget"] = {"infra":35, "social":10, "business":10, "apk":15, "housing":20, "reserve":10}
		copy["DIST_BUD"] = 50.0 + float(copy["POP"]) * 1.2
		copy["SUP"] = clamp(float(copy["LOY"]), 0.0, 100.0)
		copy["NPS"] = clamp(35.0 + (float(copy["ECO"]) - 40.0) * 0.8, 0.0, 100.0)
		districts.append(copy)
		var id: String = String(copy["id"])
		district_colors[id] = _generate_color(id)
	selected_id = String(districts[0]["id"])
	player_district_id = selected_id
	month = 1
	year = 2020
	rank = "Глава района"
	is_paused = false
	logs = ["[2020/01] Игра инициализирована. Выберите район и нажмите Старт."]
	_recompute_scores()

func _generate_color(id: String) -> Color:
	var h: int = id.hash()
	var hue: float = fmod(float(abs(h % 360)), 360.0) / 360.0
	return Color.from_hsv(hue, 0.45, 0.88, 1.0)

func selected_district() -> Dictionary:
	for d in districts:
		if String(d["id"]) == selected_id:
			return d
	return districts[0]

func player_district() -> Dictionary:
	for d in districts:
		if String(d["id"]) == player_district_id:
			return d
	return districts[0]

func set_selected_by_id(id: String) -> void:
	selected_id = id

func set_player_district(id: String) -> void:
	player_district_id = id
	selected_id = id
	add_log("Выбран стартовый район: %s" % district_name(id))

func district_name(id: String) -> String:
	for d in districts:
		if String(d["id"]) == id:
			return String(d["name"])
	return id

func can_play_as(id: String) -> bool:
	return id == player_district_id

func toggle_pause() -> bool:
	is_paused = not is_paused
	add_log("Пауза: %s" % ("включена" if is_paused else "снята"))
	return is_paused

func avg(key: String) -> float:
	var s: float = 0.0
	for d in districts:
		s += float(d[key])
	return s / max(1, districts.size())

func weighted_rdi() -> float:
	var s: float = 0.0
	var ws: float = 0.0
	for d in districts:
		var rei: float = 0.30 * float(d["INF"]) + 0.25 * float(d["ECO"]) + 0.20 * float(d["SERV"]) + 0.15 * 70.0 + 0.10 * 55.0
		var w: float = sqrt(float(d["POP"]))
		s += rei * w
		ws += w
	return s / max(0.01, ws)

func _recompute_scores() -> void:
	var rdi: float = weighted_rdi()
	support_score = clamp(0.4 * avg("SERV") + 0.3 * avg("ECO") + 0.2 * float(resources["MED"]) + 0.1 * (100.0 - avg("RISK")), 0.0, 100.0)
	var crisis_score: float = 100.0 - avg("RISK")
	var loyalty_idx: float = avg("LOY")
	var federal: float = clamp(50.0 + (float(resources["POL"]) - 100.0) / 2.0, 0.0, 100.0)
	career_score = 0.35 * rdi + 0.25 * loyalty_idx + 0.20 * crisis_score + 0.20 * federal

	if career_score >= 88.0:
		rank = "Губернатор области"
	elif career_score >= 80.0:
		rank = "Мэр Орла + глава фаланги"
	elif career_score >= 70.0:
		rank = "Глава фаланги"
	else:
		rank = "Глава района"

func add_log(message: String) -> void:
	logs.append("[%d/%02d] %s" % [year, month, message])
	if logs.size() > 120:
		logs = logs.slice(logs.size() - 120, logs.size())

func take_loan(amount: float, rate: float = 0.10) -> void:
	if amount <= 0.0:
		add_log("Займ отклонён: некорректная сумма")
		return
	resources["BUD"] = float(resources["BUD"]) + amount
	resources["debt"] = float(resources["debt"]) + amount
	resources["debt_rate"] = clamp(rate, 0.03, 0.25)
	add_log("Взят займ %.1f под %.1f%%" % [amount, float(resources["debt_rate"]) * 100.0])

func launch_foreign_tender() -> void:
	var cost: float = 80.0
	if float(resources["POL"]) < 20.0 or float(resources["BUD"]) < cost:
		add_log("Тендер отклонён: не хватает POL/BUD")
		return
	resources["BUD"] = float(resources["BUD"]) - cost
	resources["POL"] = float(resources["POL"]) - 20.0
	var success_chance: float = 0.45 + float(resources["EXP"]) / 500.0
	if randf() < success_chance:
		for d in districts:
			d["INF"] = clamp(float(d["INF"]) + 1.0, 0.0, 100.0)
			d["ECO"] = clamp(float(d["ECO"]) + 0.6, 0.0, 100.0)
		add_log("Иностранный тендер выигран: +INF/+ECO")
	else:
		resources["MED"] = clamp(float(resources["MED"]) - 3.0, 0.0, 120.0)
		add_log("Тендер проигран: репутационный ущерб")

func process_month() -> void:
	if is_paused:
		add_log("Ход пропущен: игра на паузе")
		return

	for d in districts:
		var b: Dictionary = d["budget"]
		var inf_next: float = float(d["INF"]) + 0.6 * (1.0 + (float(d["LOG"]) - 1.0)) * (float(b["infra"]) / 35.0) - clamp(0.35 - float(b["housing"]) / 100.0, 0.1, 0.35)
		d["INF"] = clamp(inf_next, 0.0, 100.0)
		d["ECO"] = clamp(float(d["ECO"]) + 0.25 * float(d["LOG"]) * (1.0 + float(b["business"]) / 100.0) - float(d["RISK"]) / 220.0, 0.0, 100.0)
		d["SERV"] = clamp(float(d["SERV"]) + float(b["social"]) / 120.0 + float(b["housing"]) / 130.0 - float(d["RISK"]) / 160.0, 0.0, 100.0)
		d["LOY"] = clamp(float(d["LOY"]) + 0.15 * ((float(d["SERV"]) - 50.0) / 10.0) + 0.1 * ((float(d["ECO"]) - 50.0) / 10.0) - float(d["RISK"]) / 200.0, 0.0, 100.0)
		d["SUP"] = clamp(0.6 * float(d["LOY"]) + 0.4 * float(d["SERV"]), 0.0, 100.0)
		var nps_delta: float = 0.15 + (float(d["SUP"]) - 50.0) / 250.0 - float(d["RISK"]) / 500.0
		if String(d["id"]) != player_district_id:
			nps_delta += 0.10
		d["NPS"] = clamp(float(d["NPS"]) + nps_delta, 0.0, 100.0)
		d["DIST_BUD"] = clamp(float(d["DIST_BUD"]) + float(d["ECO"]) * 0.2 - float(d["RISK"]) * 0.08, 10.0, 900.0)
		d["RISK"] = clamp(float(d["RISK"]) - 0.35 + randf_range(-0.2, 0.5), 0.0, 100.0)

	var avg_eco: float = avg("ECO")
	var avg_loy: float = avg("LOY")
	var debt_service: float = float(resources["debt"]) * float(resources["debt_rate"]) / 12.0
	var delta_bud: float = avg_eco * 12.0 * (0.12 + avg_eco / 500.0) + 30.0 - 12.0 - (55.0 / 9.0) - debt_service
	resources["BUD"] = clamp(float(resources["BUD"]) + delta_bud, 0.0, 5000.0)
	resources["POL"] = clamp(float(resources["POL"]) + 0.4 * (avg_loy - 50.0) / 10.0, 0.0, 300.0)
	resources["EXP"] = clamp(float(resources["EXP"]) + 0.2, 0.0, 300.0)
	resources["MED"] = clamp(float(resources["MED"]) + 0.15, 0.0, 120.0)

	if randf() < 0.14:
		var idx: int = randi() % districts.size()
		districts[idx]["RISK"] = clamp(float(districts[idx]["RISK"]) + 6.0, 0.0, 100.0)
		add_log("Кризисное событие: %s" % districts[idx]["name"])

	month += 1
	if month > 12:
		month = 1
		year += 1
		add_log("Годовой отчёт сформирован")

	_recompute_scores()
	add_log("Месяц закрыт: BUD %.1f, POL %.1f, SUP %.1f" % [float(resources["BUD"]), float(resources["POL"]), support_score])

func deploy_crisis_team() -> void:
	if float(resources["CAD"]) < 2:
		add_log("Недостаточно CAD")
		return
	resources["CAD"] = float(resources["CAD"]) - 2.0
	for d in districts:
		d["RISK"] = clamp(float(d["RISK"]) - 1.0, 0.0, 100.0)
	add_log("Развернута антикризисная команда")
	_recompute_scores()

func deploy_eco_team() -> void:
	if float(resources["CAD"]) < 2:
		add_log("Недостаточно CAD")
		return
	resources["CAD"] = float(resources["CAD"]) - 2.0
	for d in districts:
		d["INF"] = clamp(float(d["INF"]) + 0.6, 0.0, 100.0)
	add_log("Развернут экономический штаб")
	_recompute_scores()
