extends Control

func _ready() -> void:
	var bg := ColorRect.new()
	bg.color = Color("#0b1220")
	bg.anchor_right = 1.0
	bg.anchor_bottom = 1.0
	add_child(bg)

	var panel := PanelContainer.new()
	panel.anchor_left = 0.5
	panel.anchor_top = 0.5
	panel.anchor_right = 0.5
	panel.anchor_bottom = 0.5
	panel.offset_left = -180
	panel.offset_top = -200
	panel.offset_right = 180
	panel.offset_bottom = 200
	add_child(panel)

	var vb := VBoxContainer.new()
	panel.add_child(vb)

	var title := Label.new()
	title.text = "Вертикаль: Орловская область"
	vb.add_child(title)

	vb.add_spacer(false)
	_add_menu_button(vb, "Играть", _on_play)
	_add_menu_button(vb, "Загрузить", _on_load)
	_add_menu_button(vb, "Настройки", _on_settings)
	_add_menu_button(vb, "Выход", _on_exit)

func _add_menu_button(vb: VBoxContainer, text: String, callback: Callable) -> void:
	var btn := Button.new()
	btn.text = text
	btn.custom_minimum_size = Vector2(320, 48)
	btn.pressed.connect(callback)
	vb.add_child(btn)

func _on_play() -> void:
	get_tree().change_scene_to_file("res://scenes/Main.tscn")

func _on_load() -> void:
	_show_stub("Загрузка пока в разработке")

func _on_settings() -> void:
	_show_stub("Настройки пока в разработке")

func _on_exit() -> void:
	get_tree().quit()

func _show_stub(text: String) -> void:
	var dialog := AcceptDialog.new()
	dialog.dialog_text = text
	add_child(dialog)
	dialog.popup_centered()
