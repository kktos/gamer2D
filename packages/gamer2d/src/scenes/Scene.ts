import type { EventCallback } from "../events/EventBuffer";
import { EventEmitter } from "../events/EventEmitter";
import { TaskList } from "../game/TaskList";
import type { GameContext } from "../game/types/GameContext";
import { enableDebug } from "../inspectors/debug-manager.class";
import type { HTMLLayer } from "../layers/HTMLLayer";
import type { Layer } from "../layers/Layer.class";
import { createLayerByName } from "../layers/Layer.factory";
import type { TNeatLayer } from "../script/compiler2/types/layers.type";
import type { TNeatScene } from "../script/compiler2/types/scenes.type";
import { generateID } from "../utils/id.util";
import { BBox } from "../utils/maths/BBox.class";
import { getClassName } from "../utils/object.util";
import type { TimerManager } from "../utils/timermanager.class";

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

	public timers?: TimerManager;
	// private next: null;
	// private settings?: Record<string, unknown>;

	constructor(
		private gc: GameContext,
		public filename: string,
		sheet: TNeatScene,
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
		this.wannaShowCursor = (sheet.showCursor as boolean) ?? false;

		this.gravity = gc.gravity ?? 0;

		this.tasks = new TaskList();
		this.setTaskHandlers(gc);

		// for the layers
		this.gc.scene = this;

		const mergeLayers: TNeatLayer[] = [];
		for (const layerDef of sheet.layers) {
			const layer = mergeLayers.filter((l) => l.type === layerDef.type)[0];
			if (!layer) mergeLayers.push(layerDef);
			else if (layer.data && layerDef.data) layer.data = [...layer.data, ...layerDef.data];
		}

		for (const layer of mergeLayers) this.addLayer(layer.type, createLayerByName(gc, layer.type, this, layer));
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
		// else console.warn(`Layer ${name} not found`);
		return this;
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
		this.timers?.update(gc);
		for (const layer of this.layers.values()) layer.update(gc, this);
		return this;
	}

	render(gc: GameContext) {
		for (const layer of this.layers.values()) layer.render(gc);
		return this;
	}
}
