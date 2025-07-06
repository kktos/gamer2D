export const Events = {
	EVENT_MOUSECLICK: Symbol.for("MOUSECLICK"),
	EVENT_MOUSEDOWN: Symbol.for("MOUSEDOWN"),
	EVENT_MOUSEUP: Symbol.for("MOUSEUP"),

	MENU_ITEM_SELECTED: Symbol.for("MENU_ITEM_SELECTED"),
	MENU_ITEM_CLICKED: Symbol.for("MENU_ITEM_CLICKED"),

	EVENT_TIMER: Symbol.for("TIMER"),

	TASK_REMOVE_ENTITY: Symbol.for("removeEntity"),
	TASK_ADD_ENTITY: Symbol.for("addEntity"),
	TASK_ADD_BEFORE_ENTITY: Symbol.for("addBeforeEntity"),
} as const;
