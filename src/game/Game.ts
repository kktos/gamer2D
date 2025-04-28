import { GAME_EVENTS } from "../constants/events.const";
import { setupEntities, setupEntity } from "../entities/Entity.factory";
import { setupLayer, setupLayers } from "../layers/Layer.factory";
import Director from "../scene/Director";
import { type TSceneSheet, setupScene } from "../scene/Scene.factory";
import { setupTrait, setupTraits } from "../traits/Trait.factory";
import { createViewport } from "../utils/canvas.utils";
import { readGamepad } from "../utils/gamepad.util";
import { path } from "../utils/path.util";
import { parseSettings } from "../utils/settings.utils";
import { FPSManager } from "./FPSManager";
import { KeyMap } from "./KeyMap";
import ResourceManager from "./ResourceManager";
import type GameContext from "./types/GameContext";
import type { GameEvent, KeyEvent } from "./types/GameEvent";
import type { EntityConstructor, GameOptions, LayerConstructor, SceneConstructor, TraitConstructor } from "./types/GameOptions";

export default class Game {
	private fpsManager: FPSManager;
	private gc: GameContext;
	private coppola: Director | null;

	constructor(
		canvas: HTMLCanvasElement,
		public options: GameOptions,
	) {
		this.coppola = null;

		for (const [key, value] of Object.entries(this.options.paths)) {
			this.options.paths[key as keyof GameOptions["paths"]] = path(value);
		}

		const settings = parseSettings(options.settings);

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
		} else if (["mousedown", "mouseup", "mousemove", "click"].includes(e.type)) {
			x = (e as MouseEvent).clientX;
			y = (e as MouseEvent).clientY;
			evt.buttons = (e as MouseEvent).buttons;
		}

		evt.x = ((x - bbox.x) / this.gc.viewport.ratioWidth) | 0;
		evt.y = ((y - bbox.y) / this.gc.viewport.ratioHeight) | 0;

		switch (e.type) {
			case "wheel":
				evt.type = e.type;
				evt.deltaX = (e as WheelEvent).deltaX;
				evt.deltaY = (e as WheelEvent).deltaY;
				evt.deltaZ = (e as WheelEvent).deltaZ;
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
				evt.type = e.type;
				(evt as KeyEvent).key = (e as KeyboardEvent).key;
				this.gc.keys.set((e as KeyboardEvent).key, evt.type === "keydown");
				break;

			case "click":
			case "mousemove": {
				if ((e.target as HTMLElement).id !== "game") return;
				evt.type = e.type;
				this.gc.mouse.x = evt.x;
				this.gc.mouse.y = evt.y;
				break;
			}

			case "mousedown":
			case "mouseup": {
				if ((e.target as HTMLElement).id !== "game") return;
				evt.type = e.type;
				this.gc.mouse.down = evt.type === "mousedown";
				this.gc.mouse.x = evt.x;
				this.gc.mouse.y = evt.y;
				break;
			}

			case "touchmove": {
				if ((e.target as HTMLElement).id !== "game") return;
				evt.type = "mousemove";
				this.gc.mouse.x = evt.x;
				this.gc.mouse.y = evt.y;
				break;
			}
			case "touchstart": {
				if ((e.target as HTMLElement).id !== "game") return;
				evt.type = "mousedown";
				this.gc.mouse.down = true;
				this.gc.mouse.x = evt.x;
				this.gc.mouse.y = evt.y;
				break;
			}
			case "touchcancel": {
				if ((e.target as HTMLElement).id !== "game") return;
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

	async start(startScene: string, resourcesFilename: string) {
		// console.log("resourceManager.load");
		try {
			await this.gc.resourceManager.load(resourcesFilename);
		} catch (err) {
			console.error("resourceManager.load", err);
			throw err;
		}

		// console.log("new Director");
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
		coppola.run(startScene);

		for (let idx = 0; idx < GAME_EVENTS.length; idx++) window.addEventListener(GAME_EVENTS[idx], this);

		// console.log("play()");
		this.play();
	}

	addEntity(entityName: string, entityClass: EntityConstructor) {
		setupEntity({ name: entityName, classType: entityClass });
	}

	addTrait(traitClass: TraitConstructor) {
		setupTrait(traitClass);
	}

	addScene(sceneType: TSceneSheet["type"], sceneClass: SceneConstructor) {
		setupScene(sceneType, sceneClass);
	}

	addLayer(layerClass: LayerConstructor) {
		setupLayer(layerClass);
	}
}
