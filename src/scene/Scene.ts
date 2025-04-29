import type { EventCallback } from "../events/EventBuffer";
import { EventEmitter } from "../events/EventEmitter";
import { TaskList } from "../game/TaskList";
import type GameContext from "../game/types/GameContext";
import type { Layer } from "../layers/Layer";
import { createLayerByName } from "../layers/Layer.factory";
import type { UILayer } from "../layers/UILayer";
import type { BBox } from "../maths/math";
import type { TSceneSheet } from "../script/compiler/scenes/scene.rules";
import { generateID } from "../utils/id.util";
import { getClassName } from "../utils/object.util";

export class Scene {
	static SCENE_COMPLETED = Symbol.for("SCENE_COMPLETED");
	static SCENE_STARTED = Symbol.for("SCENE_STARTED");
	static TASK_RESET = Symbol.for("reset");

	public class: string;
	public id: string;

	public receiver: UILayer | null;
	// once created always there (e.g : Game scene vs Level scene)
	public isPermanent: boolean;
	public isRunning: boolean;
	public wannaShowCursor: boolean;
	public bbox: BBox;
	public tasks: TaskList;

	public gravity: number;

	private events: EventEmitter;
	private screenWidth: number;
	private screenHeight: number;
	private layers: Map<string, Layer>;
	private next: null;
	private settings?: Record<string, unknown>;

	constructor(
		private gc: GameContext,
		public name: string,
		sheet: TSceneSheet,
	) {
		this.class = getClassName(this.constructor);
		this.id = generateID();

		this.screenWidth = gc.viewport.width;
		this.screenHeight = gc.viewport.height;
		this.bbox = {
			left: 0,
			top: 0,
			right: this.screenWidth,
			bottom: this.screenHeight,
		};

		this.events = new EventEmitter();
		this.layers = new Map<string, Layer>();
		this.receiver = null;
		this.isRunning = false;
		this.isPermanent = false;
		this.next = null;
		this.wannaShowCursor = sheet.showCursor ?? false;

		this.gravity = gc.gravity ?? 0;

		this.tasks = new TaskList();
		this.setTaskHandlers(gc);

		for (const layer of sheet.layers) this.addLayer(createLayerByName(gc, layer.type, this, layer));
	}

	init(gc: GameContext) {
		for (const layer of this.layers.values()) layer.init?.(gc, this);
		return this;
	}

	on(name: symbol, listener: EventCallback) {
		this.events.on(name, listener);
		return this;
	}
	emit(name: symbol, ...args: unknown[]) {
		this.events.emit(name, ...args);
		return this;
	}

	public addLayer(layer: Layer) {
		this.layers.set(getClassName(layer), layer);
		return this;
	}

	public useLayer<T extends Layer>(name: string, fn: (layer: T) => void) {
		const layer = this.layers.get(name) as T;
		if (layer) fn(layer);
	}

	pause() {
		this.isRunning = false;
		return this;
	}
	run() {
		this.isRunning = true;
		this.gc.scene = this;
		this.events.emit(Scene.SCENE_STARTED, this.name);
		return this;
	}

	goto(nameOrIdx: string | number) {
		this.events.emit(Scene.SCENE_COMPLETED, nameOrIdx);
	}

	addTask(name: symbol, ...args: unknown[]) {
		this.tasks.addTask(name, ...args);
		return this;
	}

	setTaskHandlers(gc: GameContext) {
		// this.tasks.onTask(Scene.TASK_RESET, () => {
		// 	this.reset(gc);
		// });
		return this;
	}

	handleEvent(gc: GameContext, e) {
		if (this.receiver) this.receiver.handleEvent(gc, e);
	}

	update(gc: GameContext) {
		this.tasks.processTasks();
		for (const layer of this.layers.values()) layer.update(gc, this);
		return this;
	}

	render(gc: GameContext) {
		for (const layer of this.layers.values()) layer.render(gc);
		return this;
	}
}
