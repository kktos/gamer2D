import { GP_BUTTONS, GP_STICKS_AXES } from "../constants/gamepad.const";
import type { GameContext } from "../game/types/GameContext";
import type { GameEvent } from "../game/types/GameEvent";
import type Director from "../scene/Director";

export function readGamepad(gc: GameContext, coppola: Director) {
	if (!gc.gamepad) return;

	const gamepad = navigator.getGamepads()[gc.gamepad.id];
	if (!gamepad) return;

	if (gamepad.timestamp === gc.gamepad.lastTime) return;

	gc.gamepad.lastTime = gamepad.timestamp;
	const hMove = Number(gamepad.axes[GP_STICKS_AXES.RIGHT_HORIZONTAL].toFixed(3));
	const vMove = Number(gamepad.axes[GP_STICKS_AXES.RIGHT_VERTICAL].toFixed(3));

	if (hMove !== 0 || vMove !== 0)
		setTimeout(() => {
			// const bbox= gc.viewport.bbox;
			// const w= bbox.width/2;
			// const h= bbox.height/2;
			// const evt= {
			// 	type: "mousemove",
			// 	buttons: [],
			// 	x: (w + (w * hMove)) / gc.viewport.ratioWidth | 0,
			// 	y: (h + (h * vMove)) / gc.viewport.ratioHeight | 0,
			// 	key: undefined
			// };
			// gc.mouse.x= evt.x;
			// gc.mouse.y= evt.y;
			// coppola.handleEvent(gc, evt);

			const evt: GameEvent = {
				type: "joyaxismove",
				timestamp: gamepad.timestamp,
				vertical: vMove,
				horizontal: hMove,
			};
			coppola?.handleEvent(gc, evt);
		}, 0);

	const buttons = gamepad.buttons;
	setTimeout(() => {
		const evt: GameEvent = {
			type: "joybuttondown",
			timestamp: gamepad?.timestamp,
			X: buttons[GP_BUTTONS.X].pressed,
			Y: buttons[GP_BUTTONS.Y].pressed,
			A: buttons[GP_BUTTONS.A].pressed,
			B: buttons[GP_BUTTONS.B].pressed,
			CURSOR_UP: buttons[GP_BUTTONS.CURSOR_UP].pressed,
			CURSOR_DOWN: buttons[GP_BUTTONS.CURSOR_DOWN].pressed,
			CURSOR_LEFT: buttons[GP_BUTTONS.CURSOR_LEFT].pressed,
			CURSOR_RIGHT: buttons[GP_BUTTONS.CURSOR_RIGHT].pressed,
			TRIGGER_LEFT: buttons[GP_BUTTONS.TRIGGER_LEFT].pressed,
			TRIGGER_RIGHT: buttons[GP_BUTTONS.TRIGGER_RIGHT].pressed,
		};
		coppola?.handleEvent(gc, evt);
	}, 0);
}
