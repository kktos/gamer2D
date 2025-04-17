interface GameJoyStickAxisMoveEvent {
	type: "joyaxismove";
	timestamp: number;
	vertical: number;
	horizontal: number;
}

interface GameJoystickBtnDownEvent {
	type: "joybuttondown";
	timestamp: number;
	X: boolean;
	Y: boolean;
	A: boolean;
	B: boolean;
	CURSOR_UP: boolean;
	CURSOR_DOWN: boolean;
	CURSOR_LEFT: boolean;
	CURSOR_RIGHT: boolean;
	TRIGGER_LEFT: boolean;
	TRIGGER_RIGHT: boolean;
}

export interface BaseEvent {
	type: "none"| "click" | "mousemove" | "mousedown" | "mouseup" | "wheel" | "keyup" | "keydown";
	x: number;
	y: number;
	buttons?: number;
	key?: string;
	// wheel event data
	deltaX: number;
	deltaY: number;
	deltaZ: number;

	pageX?: number;
	pageY?: number;
}

export type GameEvent = BaseEvent | GameJoystickBtnDownEvent | GameJoyStickAxisMoveEvent;
