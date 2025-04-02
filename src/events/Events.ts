// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class Events {
	static EVENT_MOUSECLICK = Symbol.for("click");
	static EVENT_MOUSEDOWN = Symbol.for("mouse_down");
	static EVENT_MOUSEUP = Symbol.for("mouse_up");
	static MENU_ITEM_SELECTED = Symbol.for("MENU_ITEM_SELECTED");
	static MENU_ITEM_CLICKED = Symbol.for("MENU_ITEM_CLICKED");
}
