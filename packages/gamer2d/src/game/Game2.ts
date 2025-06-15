import { GAME_EVENTS } from "../constants/events.const";
import { setupEntities } from "../entities/Entity.factory";
import { enableDebugInspectors } from "../inspectors/debug-manager.class";
import { setupLayers } from "../layers/Layer.factory";
import { Timers } from "../layers/display/timers.class";
import { Director } from "../scene/Director";
import { setupTraits } from "../traits/Trait.factory";
import { createViewport } from "../utils/canvas.utils";
import { readGamepad } from "../utils/gamepad.util";
import { Loader } from "../utils/loaders.util";
import { path } from "../utils/path.util";
import { parseSettings } from "../utils/settings.utils";
import { FPSManager } from "./FPSManager";
import { addEntity, addLayer, addScene, addTrait } from "./GameHelpers";
import { KeyMap } from "./KeyMap";
import { ResourceManager, type TResourceGroupsDict } from "./ResourceManager";
import { SpriteSheet } from "./Spritesheet";
import { GLOBAL_VARIABLES } from "./globals";
import type { GameContext } from "./types/GameContext";
import type { GameEvent, KeyEvent } from "./types/GameEvent";
import type { GameOptions } from "./types/GameOptions";

export class Game {
	private fpsManager: FPSManager;
	private gc: GameContext;
	public coppola: Director | null;
	public isDebugEnabled = false;

	constructor(
		canvas: HTMLCanvasElement,
		public options: GameOptions,
	) {
		this.coppola = null;

		for (const [key, value] of Object.entries(this.options.paths)) {
			this.options.paths[key as keyof GameOptions["paths"]] = path(value);
		}

		const settings = parseSettings(options.settings);

		if (settings.has("LOGS")) {
			const logs = settings.get("LOGS").split(/\s*,\s*/);
			if (logs.includes("Timer")) {
				Timers.wannaLog = true;
			}
			if (logs.includes("Loader")) {
				Loader.wannaLog = true;
			}
			if (logs.includes("SpriteSheet")) {
				SpriteSheet.wannaLog = true;
			}
		}

		if (this.options.isDebugEnabled) this.isDebugEnabled = true;

		const FPS = settings.getNumber("FPS") ?? 60;
		this.gc = {
			viewport: createViewport(canvas, {
				width: settings.getNumber("VIEWPORT.WIDTH"),
				height: settings.getNumber("VIEWPORT.HEIGHT"),
				ratio: settings.getNumber("VIEWPORT.RATIO"),
			}),
			ui: { height: settings.getNumber("UI.HEIGHT") ?? 200 },

			resourceManager: new ResourceManager(this.options, settings),

			options: this.options,

			FPS,
			dt: 1 / FPS,
			tick: 0,
			deltaTime: 0,
			totalTime: 0,

			mouse: { x: 0, y: 0, down: false },
			gamepad: null,
			keys: new KeyMap(),
			scene: null,

			gravity: settings.getNumber("PHYSICS.GRAVITY") ?? 50,

			wannaPauseOnBlur: true,

			globals: {
				set: (name: string, value) => GLOBAL_VARIABLES.set(name, value),
				get: (name: string) => GLOBAL_VARIABLES.get(name),
				has: (name: string) => GLOBAL_VARIABLES.has(name),
			},
		};

		this.gc.viewport.ctx.scale(this.gc.viewport.ratioWidth, this.gc.viewport.ratioHeight);

		this.fpsManager = new FPSManager(FPS);

		if (options.entities) setupEntities(options.entities);
		if (options.traits) setupTraits(options.traits);
		if (options.layers) setupLayers(options.layers);
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

	handleEvent(e: Event) {
		if (!e.isTrusted) return;

		if ((e.target as HTMLElement).className === "overlay") return;
		// debug windows
		if (["PROPERTIES-INSPECTOR", "ITEMS-INSPECTOR"].includes((e.target as HTMLElement)?.tagName)) return;

		const bbox = this.gc.viewport.bbox;
		const evt: GameEvent = {
			type: "none",
			x: 0,
			y: 0,
			deltaX: 0,
			deltaY: 0,
			deltaZ: 0,
		};

		let x = 0;
		let y = 0;

		if (["touchstart", "touchend", "touchcancel", "touchmove"].includes(e.type)) {
			const touch = (e as TouchEvent).touches[0] || (e as TouchEvent).changedTouches[0];
			x = touch.pageX;
			y = touch.pageY;
		} else if (["mousedown", "mouseup", "mousemove", "click", "wheel"].includes(e.type)) {
			x = (e as MouseEvent).clientX;
			y = (e as MouseEvent).clientY;
			evt.buttons = (e as MouseEvent).buttons;
		}

		evt.x = Math.floor(((x - bbox.x) * this.gc.viewport.width) / bbox.width);
		evt.y = Math.floor(((y - bbox.y) * this.gc.viewport.height) / bbox.height);

		switch (e.type) {
			case "wheel":
				evt.type = e.type;
				evt.deltaX = (e as WheelEvent).deltaX;
				evt.deltaY = (e as WheelEvent).deltaY;
				evt.deltaZ = (e as WheelEvent).deltaZ;
				e.preventDefault();
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
			case "keydown": {
				evt.type = e.type;
				const key = (e as KeyboardEvent).key;
				(evt as KeyEvent).key = key;
				this.gc.keys.set(key, evt.type === "keydown");
				break;
			}

			case "click":
			case "mousemove": {
				// if ((e.target as HTMLElement).id !== "game") return;
				if (!(e.target instanceof HTMLCanvasElement)) return;
				evt.type = e.type;
				this.gc.mouse.x = evt.x;
				this.gc.mouse.y = evt.y;
				break;
			}

			case "mousedown":
			case "mouseup": {
				// if ((e.target as HTMLElement).id !== "game") return;
				if (!(e.target instanceof HTMLCanvasElement)) return;
				evt.type = e.type;
				this.gc.mouse.down = evt.type === "mousedown";
				this.gc.mouse.x = evt.x;
				this.gc.mouse.y = evt.y;
				break;
			}

			case "touchmove": {
				// if ((e.target as HTMLElement).id !== "game") return;
				if (!(e.target instanceof HTMLCanvasElement)) return;
				evt.type = "mousemove";
				this.gc.mouse.x = evt.x;
				this.gc.mouse.y = evt.y;
				break;
			}
			case "touchstart": {
				// if ((e.target as HTMLElement).id !== "game") return;
				if (!(e.target instanceof HTMLCanvasElement)) return;
				evt.type = "mousedown";
				this.gc.mouse.down = true;
				this.gc.mouse.x = evt.x;
				this.gc.mouse.y = evt.y;
				break;
			}
			case "touchcancel": {
				// if ((e.target as HTMLElement).id !== "game") return;
				if (!(e.target instanceof HTMLCanvasElement)) return;
				evt.type = "mouseup";
				this.gc.mouse.down = false;
				this.gc.mouse.x = evt.x;
				this.gc.mouse.y = evt.y;
				break;
			}

			case "devicemotion":
				console.log("devicemotion", (e as DeviceMotionEvent).rotationRate);
				break;

			case "gamepadconnected":
				this.gc.gamepad = { id: (e as GamepadEvent).gamepad.index, lastTime: 0 };
				return;
			case "gamepaddisconnected":
				this.gc.gamepad = null;
				return;
		}

		this.coppola?.handleEvent(this.gc, evt);
	}

	async load(resources: string | TResourceGroupsDict) {
		return this.gc.resourceManager.load(resources);
	}

	async start(startScene: string) {
		const coppola = new Director(this.gc);
		this.coppola = coppola;
		const onTimerUpdate = (deltaTime: number) => {
			this.gc.tick++;
			this.gc.deltaTime = deltaTime;
			this.gc.totalTime += deltaTime;
			this.gc.gamepad && readGamepad(this.gc, coppola);
			coppola.update(this.gc);
		};
		this.fpsManager.on(onTimerUpdate);

		await coppola.run(startScene);

		for (let idx = 0; idx < GAME_EVENTS.length; idx++) window.addEventListener(GAME_EVENTS[idx], this, { passive: false });

		// console.log("play()");
		this.play();

		if (this.isDebugEnabled) enableDebugInspectors(coppola);
	}

	setGlobal(name: string, value: unknown) {
		this.gc.globals.set(name, value);
	}
	getGlobal(name: string) {
		return this.gc.globals.get(name);
	}

	uselessMethodToIncludeHelpers() {
		addEntity;
		addLayer;
		addScene;
		addTrait;
	}
}
