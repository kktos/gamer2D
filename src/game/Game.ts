import { GAME_EVENTS } from "../constants/events.const";
import { GP_BUTTONS, GP_STICKS_AXES } from "../constants/gamepad.const";
import type { Entity } from "../entities/Entity";
import { setupEntities } from "../entities/EntityFactory";
import ENV from "../env";
import Director from "../scene/Director";
import { createViewport } from "../utils/canvas.utils";
import { FPSManager } from "./FPSManager";
import type GameContext from "./GameContext";
import { KeyMap } from "./KeyMap";
import ResourceManager from "./ResourceManager";

export type entityDefinition = { name: string; className: string; classType: Entity };

export type GameOptions = {
	paths: {
		spritesheets: string;
		audiosheets: string;
		fonts: string;
		scenes: string;
	};
	audio: {
		volume: number;
	};
	entities: entityDefinition[];
};

export default class Game {
	private fpsManager: FPSManager;
	private gc: GameContext;
	private coppola: Director | null;

	constructor(canvas: HTMLCanvasElement, options: GameOptions) {
		this.coppola = null;

		this.gc = {
			viewport: createViewport(canvas),

			resourceManager: new ResourceManager(options),

			dt: 1 / ENV.FPS,
			tick: 0,
			deltaTime: 0,
			totalTime: 0,

			mouse: { x: 0, y: 0, down: false },
			gamepad: null,
			keys: new KeyMap(),
			scene: null,

			wannaPauseOnBlur: true,
		};

		this.gc.viewport.ctx.scale(this.gc.viewport.ratioWidth, this.gc.viewport.ratioHeight);
		// this.gc.viewport.ctx.scale(this.gc.viewport.ratioWidth,this.gc.viewport.ratioWidth);

		const onTimerUpdate = (deltaTime: number) => {
			this.gc.tick++;
			this.gc.deltaTime = deltaTime;
			this.gc.totalTime += deltaTime;
			this.gc.gamepad && this.readGamepad();
			this.coppola?.update(this.gc);
		};
		this.fpsManager = new FPSManager(ENV.FPS, onTimerUpdate);

		setupEntities(options.entities);
	}

	pause() {
		this.fpsManager.stop();

		const overlay = document.createElement("div");
		overlay.className = "overlay";
		overlay.id = "gamepaused";
		const msg = document.createElement("div");
		msg.className = "gamepaused";
		msg.innerText = "GAME PAUSED";
		overlay.appendChild(msg);
		document.body.appendChild(overlay);
	}

	play() {
		const overlay = document.querySelector("#gamepaused");
		overlay?.remove();

		this.fpsManager.start();
	}

	readGamepad() {
		if (!this.gc.gamepad) return;

		const gamepad = navigator.getGamepads()[this.gc.gamepad.id];
		if (!gamepad) return;

		if (gamepad.timestamp === this.gc.gamepad.lastTime) return;

		this.gc.gamepad.lastTime = gamepad.timestamp;
		const hMove = Number(gamepad.axes[GP_STICKS_AXES.RIGHT_HORIZONTAL].toFixed(3));
		const vMove = Number(gamepad.axes[GP_STICKS_AXES.RIGHT_VERTICAL].toFixed(3));

		if (hMove !== 0 || vMove !== 0)
			setTimeout(() => {
				// const bbox= this.gc.viewport.bbox;
				// const w= bbox.width/2;
				// const h= bbox.height/2;
				// const evt= {
				// 	type: "mousemove",
				// 	buttons: [],
				// 	x: (w + (w * hMove)) / this.gc.viewport.ratioWidth | 0,
				// 	y: (h + (h * vMove)) / this.gc.viewport.ratioHeight | 0,
				// 	key: undefined
				// };
				// this.gc.mouse.x= evt.x;
				// this.gc.mouse.y= evt.y;
				// this.coppola.handleEvent(this.gc, evt);

				const evt = {
					type: "joyaxismove",
					timestamp: gamepad.timestamp,
					vertical: vMove,
					horizontal: hMove,
				};
				this.coppola?.handleEvent(this.gc, evt);
			}, 0);

		const buttons = gamepad.buttons;
		setTimeout(() => {
			const evt = {
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
			this.coppola?.handleEvent(this.gc, evt);
		}, 0);
	}

	handleEvent(e) {
		if (!e.isTrusted) return;

		if (e.srcElement.className === "overlay") return;

		let x = 0;
		let y = 0;

		if (["touchstart", "touchend", "touchcancel", "touchmove"].includes(e.type)) {
			const touch = e.touches[0] || e.changedTouches[0];
			x = touch.pageX;
			y = touch.pageY;
		}

		if (["mousedown", "mouseup", "mousemove", "click"].includes(e.type)) {
			x = e.clientX;
			y = e.clientY;
		}

		const bbox = this.gc.viewport.bbox;
		const evt = {
			type: e.type,
			buttons: e.buttons,
			x: ((x - bbox.x) / this.gc.viewport.ratioWidth) | 0,
			y: ((y - bbox.y) / this.gc.viewport.ratioHeight) | 0,
			key: undefined,
			// wheel event data
			deltaX: 0,
			deltaY: 0,
			deltaZ: 0,
		};

		switch (e.type) {
			case "wheel":
				evt.deltaX = e.deltaX;
				evt.deltaY = e.deltaY;
				evt.deltaZ = e.deltaZ;
				break;

			case "contextmenu":
				e.preventDefault();
				return;

			case "focus":
				if (this.gc.wannaPauseOnBlur) this.play();
				return;

			case "blur":
				if (this.gc.wannaPauseOnBlur) this.pause();
				return;

			case "keyup":
			case "keydown":
				evt.key = e.key;
				this.gc.keys.set(e.key, evt.type === "keydown");
				break;

			case "click":
			// if (evt.x > this.gc.viewport.width - 50 && evt.y > this.gc.viewport.height - 50) console.show();
			case "mousedown":
			case "mouseup":
			case "mousemove": {
				if (e.target.id !== "game") return;
				this.gc.mouse.down = evt.type === "mousedown";
				this.gc.mouse.x = evt.x;
				this.gc.mouse.y = evt.y;
				break;
			}

			case "touchmove": {
				evt.type = "mousemove";
				this.gc.mouse.x = evt.x;
				this.gc.mouse.y = evt.y;
				break;
			}
			case "touchstart": {
				evt.type = "mousedown";
				this.gc.mouse.x = evt.x;
				this.gc.mouse.y = evt.y;
				break;
			}
			case "touchcancel": {
				evt.type = "mouseup";
				this.gc.mouse.x = evt.x;
				this.gc.mouse.y = evt.y;
				break;
			}

			case "devicemotion":
				console.log("devicemotion", e.rotationRate);
				break;

			case "gamepadconnected":
				this.gc.gamepad = { id: e.gamepad.index, lastTime: 0 };
				break;
			case "gamepaddisconnected":
				this.gc.gamepad = null;
				break;
		}
		this.coppola?.handleEvent(this.gc, evt);
	}

	async start(startScene: string, resourcesFilename: string) {
		// console.log("resourceManager.load");
		try {
			await this.gc.resourceManager.load(resourcesFilename);
		} catch (err) {
			console.error("resourceManager.load", err);
			throw err;
		}

		// console.log("new Director");
		this.coppola = new Director(this.gc);
		this.coppola.run(startScene);

		for (let idx = 0; idx < GAME_EVENTS.length; idx++) window.addEventListener(GAME_EVENTS[idx], this);

		// console.log("play()");
		this.play();
	}
}
