extends Control
class_name MapCanvas

signal district_clicked(district_id: String)
signal district_hovered(district_id: String)

var border_points: Array = []
var districts: Array[Dictionary] = []
var selected_id: String = ""
var hovered_id: String = ""
var map_mode: String = "LOY"
var map_rect: Rect2 = Rect2(0, 0, 960, 780)

var map_texture: Texture2D
var projected_points: Dictionary = {}
var district_cells: Dictionary = {}

func configure(border: Array, district_items: Array, selected: String, mode: String) -> void:
	border_points = border
	districts = district_items
	selected_id = selected
	map_mode = mode
	_rebuild_geometry()
	queue_redraw()

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_STOP
	if ResourceLoader.exists("res://assets/orlov_map_reference.png"):
		map_texture = load("res://assets/orlov_map_reference.png") as Texture2D

func _draw() -> void:
	map_rect = Rect2(Vector2(10, 10), size - Vector2(20, 20))
	if map_texture != null:
		draw_texture_rect(map_texture, map_rect, false)
		draw_rect(map_rect, Color(1, 1, 1, 0.12), false, 2.0)
	else:
		draw_rect(map_rect, Color("#111827"), true)
	_draw_outline()
	_draw_cells_overlay()
	_draw_points()
	var font: Font = get_theme_default_font()
	draw_string(font, map_rect.position + Vector2(12, 20), "Наведи на район: границы подсвечиваются", HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color.WHITE)

func _rebuild_geometry() -> void:
	projected_points.clear()
	district_cells.clear()
	if districts.is_empty():
		return
	for d in districts:
		var id: String = String(d["id"])
		projected_points[id] = _project_geo(float(d["lat"]), float(d["lon"]))

	for d in districts:
		var id: String = String(d["id"])
		var p: Vector2 = projected_points[id]
		var cell: Array[Vector2] = [
			map_rect.position,
			Vector2(map_rect.end.x, map_rect.position.y),
			map_rect.end,
			Vector2(map_rect.position.x, map_rect.end.y)
		]
		for other in districts:
			var other_id: String = String(other["id"])
			if other_id == id:
				continue
			var q: Vector2 = projected_points[other_id]
			var n: Vector2 = q - p
			var c: float = (q.dot(q) - p.dot(p)) / 2.0
			cell = _clip_halfplane(cell, n, c)
			if cell.is_empty():
				break
		district_cells[id] = cell

func _clip_halfplane(poly: Array[Vector2], n: Vector2, c: float) -> Array[Vector2]:
	var out: Array[Vector2] = []
	if poly.is_empty():
		return out
	for i in range(poly.size()):
		var a: Vector2 = poly[i]
		var b: Vector2 = poly[(i + 1) % poly.size()]
		var da: float = n.dot(a) - c
		var db: float = n.dot(b) - c
		var ina: bool = da <= 0.0
		var inb: bool = db <= 0.0
		if ina and inb:
			out.append(b)
		elif ina and not inb:
			var t1: float = da / (da - db)
			out.append(a.lerp(b, t1))
		elif not ina and inb:
			var t2: float = da / (da - db)
			out.append(a.lerp(b, t2))
			out.append(b)
	return out

func _draw_outline() -> void:
	var pts: PackedVector2Array = PackedVector2Array()
	for p in border_points:
		var pp: Array = p
		pts.append(_project_geo(float(pp[1]), float(pp[0])))
	draw_polyline(pts, Color(0.9, 1.0, 0.95, 0.8), 2.0, true)

func _draw_cells_overlay() -> void:
	for d in districts:
		var id: String = String(d["id"])
		if not district_cells.has(id):
			continue
		var poly: Array[Vector2] = district_cells[id]
		if poly.size() < 3:
			continue
		var packed: PackedVector2Array = PackedVector2Array(poly)
		var value: float = float(d[map_mode])
		var base: Color = _value_color(value)
		if id == hovered_id:
			draw_colored_polygon(packed, Color(base.r, base.g, base.b, 0.25))
			draw_polyline(packed, Color(1, 0.95, 0.25, 0.95), 3.0, true)
		elif id == selected_id:
			draw_colored_polygon(packed, Color(base.r, base.g, base.b, 0.18))
			draw_polyline(packed, Color(0.9, 1.0, 1.0, 0.95), 2.0, true)
		else:
			draw_polyline(packed, Color(0.1, 0.12, 0.13, 0.35), 1.0, true)

func _draw_points() -> void:
	for d in districts:
		var id: String = String(d["id"])
		if not projected_points.has(id):
			continue
		var p: Vector2 = projected_points[id]
		var value: float = float(d[map_mode])
		var col: Color = _value_color(value)
		var radius: float = 8.0 if id == selected_id else 5.0
		draw_circle(p, radius, col)
		if id == selected_id or id == hovered_id:
			draw_string(get_theme_default_font(), p + Vector2(10, -8), String(d["name"]), HORIZONTAL_ALIGNMENT_LEFT, -1, 13, Color.WHITE)

func _project_geo(lat: float, lon: float) -> Vector2:
	var min_lon: float = 34.9
	var max_lon: float = 37.9
	var min_lat: float = 51.95
	var max_lat: float = 53.6
	var x: float = map_rect.position.x + ((lon - min_lon) / (max_lon - min_lon)) * map_rect.size.x
	var y: float = map_rect.position.y + (1.0 - (lat - min_lat) / (max_lat - min_lat)) * map_rect.size.y
	return Vector2(x, y)

func _value_color(value: float) -> Color:
	var n: float = clamp((100.0 - value) if map_mode == "RISK" else value, 0.0, 100.0) / 100.0
	return Color(1.0 - n, 0.2 + n * 0.7, 0.25)

func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseMotion:
		var mpos: Vector2 = event.position
		_update_hover(mpos)
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		var pos: Vector2 = event.position
		if map_rect.has_point(pos):
			_select_nearest(pos)

func _update_hover(pos: Vector2) -> void:
	if not map_rect.has_point(pos):
		if hovered_id != "":
			hovered_id = ""
			queue_redraw()
		return
	var new_hover: String = _find_polygon_hit(pos)
	if new_hover == "":
		new_hover = _nearest_id(pos)
	if new_hover != hovered_id:
		hovered_id = new_hover
		emit_signal("district_hovered", hovered_id)
		queue_redraw()

func _find_polygon_hit(pos: Vector2) -> String:
	for d in districts:
		var id: String = String(d["id"])
		if not district_cells.has(id):
			continue
		var poly: Array[Vector2] = district_cells[id]
		if Geometry2D.is_point_in_polygon(pos, PackedVector2Array(poly)):
			return id
	return ""

func _nearest_id(pos: Vector2) -> String:
	var best_dist: float = 999999.0
	var best_id: String = ""
	for d in districts:
		var id: String = String(d["id"])
		if not projected_points.has(id):
			continue
		var p: Vector2 = projected_points[id]
		var dd: float = p.distance_to(pos)
		if dd < best_dist:
			best_dist = dd
			best_id = id
	return best_id

func _select_nearest(pos: Vector2) -> void:
	var id: String = _find_polygon_hit(pos)
	if id == "":
		id = _nearest_id(pos)
	if id != "":
		emit_signal("district_clicked", id)
