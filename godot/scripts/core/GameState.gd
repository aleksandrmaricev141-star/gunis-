extends RefCounted
class_name GameState

var month: int = 1
var year: int = 1
var rank: String = "Глава района"
var map_mode: String = "LOY"

var resources: Dictionary = {"BUD":1200.0, "POL":120.0, "CAD":24.0, "EXP":35.0, "MED":28.0, "debt":180.0}
var districts: Array[Dictionary] = []
var selected_id: String = ""
var career_score: float = 52.0
var support_score: float = 54.0
var logs: Array[String] = []

func setup(district_data: Array) -> void:
	districts.clear()
	for d in district_data:
		var copy: Dictionary = (d as Dictionary).duplicate(true)
		copy["budget"] = {"infra":35, "social":10, "business":10, "apk":15, "housing":20, "reserve":10}
		districts.append(copy)
	selected_id = String(districts[0]["id"])
	logs = ["[Г1 М1] Godot-only версия инициализирована."]
	_recompute_scores()

func selected_district() -> Dictionary:
	for d in districts:
		if String(d["id"]) == selected_id:
			return d
	return districts[0]

func set_selected_by_id(id: String) -> void:
	selected_id = id

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

	if career_score >= 85.0:
		rank = "Губернатор"
	elif career_score >= 75.0:
		rank = "Вице-губернатор"
	elif career_score >= 60.0:
		rank = "Кандидат на повышение"
	else:
		rank = "Глава района"

func add_log(message: String) -> void:
	logs.append("[Г%s М%s] %s" % [year, month, message])
	if logs.size() > 120:
		logs = logs.slice(logs.size() - 120, logs.size())

func process_month() -> void:
	for d in districts:
		var b: Dictionary = d["budget"]
		var inf_next: float = float(d["INF"]) + 0.6 * (1.0 + (float(d["LOG"]) - 1.0)) * (float(b["infra"]) / 35.0) - clamp(0.35 - float(b["housing"]) / 100.0, 0.1, 0.35)
		d["INF"] = clamp(inf_next, 0.0, 100.0)
		d["ECO"] = clamp(float(d["ECO"]) + 0.25 * float(d["LOG"]) * (1.0 + float(b["business"]) / 100.0) - float(d["RISK"]) / 220.0, 0.0, 100.0)
		d["SERV"] = clamp(float(d["SERV"]) + float(b["social"]) / 120.0 + float(b["housing"]) / 130.0 - float(d["RISK"]) / 160.0, 0.0, 100.0)
		d["LOY"] = clamp(float(d["LOY"]) + 0.15 * ((float(d["SERV"]) - 50.0) / 10.0) + 0.1 * ((float(d["ECO"]) - 50.0) / 10.0) - float(d["RISK"]) / 200.0, 0.0, 100.0)
		d["RISK"] = clamp(float(d["RISK"]) - 0.35 + randf_range(-0.2, 0.5), 0.0, 100.0)

	var avg_eco: float = avg("ECO")
	var avg_loy: float = avg("LOY")
	var delta_bud: float = avg_eco * 12.0 * (0.12 + avg_eco / 500.0) + 30.0 - 12.0 - (55.0 / 9.0)
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
