// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class Events {
	static EVENT_MOUSECLICK = Symbol.for("MOUSECLICK");
	static EVENT_MOUSEDOWN = Symbol.for("MOUSEDOWN");
	static EVENT_MOUSEUP = Symbol.for("MOUSEUP");
	static MENU_ITEM_SELECTED = Symbol.for("MENU_ITEM_SELECTED");
	static MENU_ITEM_CLICKED = Symbol.for("MENU_ITEM_CLICKED");
}
