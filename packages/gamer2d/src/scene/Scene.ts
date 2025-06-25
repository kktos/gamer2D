import type { EventCallback } from "../events/EventBuffer";
import { EventEmitter } from "../events/EventEmitter";
import { TaskList } from "../game/TaskList";
import type { GameContext } from "../game/types/GameContext";
import { enableDebug } from "../inspectors/debug-manager.class";
import type { HTMLLayer } from "../layers/HTMLLayer";
import type { Layer } from "../layers/Layer";
import { createLayerByName } from "../layers/Layer.factory";
import { BBox } from "../maths/BBox.class";
import type { TSceneSheet } from "../script/compiler/scenes/scene.rules";
import { generateID } from "../utils/id.util";
import { getClassName } from "../utils/object.util";

export class LayerMap extends Map<string, Layer> {
	[Symbol.for("inspect")]() {
		return [...this.keys()];
	}
}

export class Scene {
	static SCENE_COMPLETED = Symbol.for("SCENE_COMPLETED");
	static SCENE_STARTED = Symbol.for("SCENE_STARTED");
	static TASK_RESET = Symbol.for("reset");

	public class: string;
	public id: string;
	public name: string;

	public receiver: HTMLLayer | null;

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
	private layers: LayerMap;
	// private next: null;
	// private settings?: Record<string, unknown>;

	constructor(
		private gc: GameContext,
		public filename: string,
		sheet: TSceneSheet,
	) {
		this.class = getClassName(this.constructor);
		this.id = generateID();
		this.name = sheet.name;

		enableDebug(sheet.debug === true);

		this.screenWidth = gc.viewport.width;
		this.screenHeight = gc.viewport.height;
		this.bbox = new BBox(0, 0, this.screenWidth, this.screenHeight);

		this.events = new EventEmitter();
		this.layers = new LayerMap();
		this.receiver = null;
		this.isRunning = false;
		this.isPermanent = false;
		// this.next = null;
		this.wannaShowCursor = sheet.showCursor ?? false;

		this.gravity = gc.gravity ?? 0;

		this.tasks = new TaskList();
		this.setTaskHandlers(gc);

		// for the layers
		this.gc.scene = this;

		for (const layerDef of sheet.layers) this.addLayer(layerDef.type, createLayerByName(gc, layerDef.type, this, layerDef));
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

	public addLayer(name: string, layer: Layer) {
		this.layers.set(name, layer);
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
		// this.gc.scene = this;
		this.events.emit(Scene.SCENE_STARTED, this.filename);
		return this;
	}

	goto(nameOrIdx: string | number) {
		this.events.emit(Scene.SCENE_COMPLETED, nameOrIdx);
	}

	addTask(name: symbol, ...args: unknown[]) {
		this.tasks.addTask(name, ...args);
		return this;
	}

	setTaskHandlers(_gc: GameContext) {
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
