extends Control
class_name MapCanvas

signal district_clicked(district_id: String)

var border_points: Array = []
var districts: Array[Dictionary] = []
var selected_id := ""
var map_mode := "LOY"
var map_rect := Rect2(0, 0, 960, 780)

func configure(border: Array, district_items: Array, selected: String, mode: String) -> void:
	border_points = border
	districts = district_items
	selected_id = selected
	map_mode = mode
	queue_redraw()

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_STOP

func _draw() -> void:
	map_rect = Rect2(Vector2(10, 10), size - Vector2(20, 20))
	draw_rect(map_rect, Color("#111827"), true)
	_draw_outline()
	_draw_points()
	var font = get_theme_default_font()
	draw_string(font, map_rect.position + Vector2(12, 20), "Орловская область — гео-контур и центры районов", HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color.WHITE)

func _draw_outline() -> void:
	var pts := PackedVector2Array()
	for p in border_points:
		pts.append(_project_geo(p[1], p[0]))
	draw_colored_polygon(pts, Color(0.12, 0.35, 0.22, 0.45))
	for i in range(pts.size()):
		draw_line(pts[i], pts[(i + 1) % pts.size()], Color(0.5, 0.9, 0.65), 2.0)

func _draw_points() -> void:
	for d in districts:
		var p := _project_geo(d["lat"], d["lon"])
		var value := float(d[map_mode])
		var col := _value_color(value)
		var radius := 8.0 if d["id"] == selected_id else 5.0
		draw_circle(p, radius, col)
		if d["id"] == selected_id:
			draw_string(get_theme_default_font(), p + Vector2(10, -8), d["name"], HORIZONTAL_ALIGNMENT_LEFT, -1, 13, Color.WHITE)

func _project_geo(lat: float, lon: float) -> Vector2:
	var min_lon := 34.9
	var max_lon := 37.9
	var min_lat := 51.95
	var max_lat := 53.6
	var x := map_rect.position.x + ((lon - min_lon) / (max_lon - min_lon)) * map_rect.size.x
	var y := map_rect.position.y + (1.0 - (lat - min_lat) / (max_lat - min_lat)) * map_rect.size.y
	return Vector2(x, y)

func _value_color(value: float) -> Color:
	var n := clamp((100.0 - value) if map_mode == "RISK" else value, 0.0, 100.0) / 100.0
	return Color(1.0 - n, 0.2 + n * 0.7, 0.25)

func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		var pos := event.position
		if map_rect.has_point(pos):
			_select_nearest(pos)

func _select_nearest(pos: Vector2) -> void:
	var best_dist := 999999.0
	var best_id := ""
	for d in districts:
		var p := _project_geo(d["lat"], d["lon"])
		var dd := p.distance_to(pos)
		if dd < best_dist:
			best_dist = dd
			best_id = d["id"]
	if best_dist <= 24.0:
		emit_signal("district_clicked", best_id)
