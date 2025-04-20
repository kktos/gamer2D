import { EventEmitter } from "../events/EventEmitter";
import type GameContext from "../game/GameContext";
import { TaskList } from "../game/TaskList";
import type { Layer } from "../layers/Layer";
import type { UILayer } from "../layers/UILayer";
import type { BBox } from "../maths/math";
import { generateID } from "../utils/id.util";

export class Scene {
	static EVENT_COMPLETE = Symbol.for("SCENE_COMPLETE");
	static EVENT_START = Symbol.for("SCENE_START");
	static TASK_RESET = Symbol.for("reset");

	public class: string;
	public id: string;

	public events: EventEmitter;
	public receiver: UILayer | null;
	// once created always there (e.g : Game scene vs Level scene)
	public isPermanent: boolean;
	public isRunning: boolean;
	public bbox: BBox;
	public tasks: TaskList;

	private screenWidth: number;
	private screenHeight: number;
	private layers: Layer[];
	private next: null;

	constructor(
		private gc: GameContext,
		public name: string,
		private settings?: Record<string, unknown>,
	) {
		const m = String(this.constructor).match(/class ([a-zA-Z0-9_]+)/);
		this.class = m?.[1] ?? "Scene??";
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
		this.layers = [];
		this.receiver = null;
		this.isRunning = false;
		this.isPermanent = false;
		this.next = null;

		this.tasks = new TaskList();
		this.setTaskHandlers(gc);
	}

	init(gc: GameContext) {
		for (let idx = 0; idx < this.layers.length; idx++) this.layers[idx].init?.(gc, this);
		return this;
	}

	addLayer(layer: Layer) {
		this.layers.push(layer);
		return this;
	}

	update(gc: GameContext) {
		this.tasks.processTasks();
		for (const layer of this.layers) layer.update(gc, this);
		return this;
	}

	render(gc: GameContext) {
		for (const layer of this.layers) layer.render(gc);
		return this;
	}

	pause() {
		this.isRunning = false;
		return this;
	}
	run() {
		this.isRunning = true;
		this.gc.scene = this;
		this.events.emit(Scene.EVENT_START, this.name);
		return this;
	}

	handleEvent(gc: GameContext, e) {
		if (this.receiver) this.receiver.handleEvent(gc, e);
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
}
