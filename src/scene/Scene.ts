import { EventEmitter } from "../events/EventEmitter";
import type GameContext from "../game/GameContext";
import { TaskList } from "../game/TaskList";
import type { Layer } from "../layers/Layer";
import type { UILayer } from "../layers/UILayer";
import type { BBox } from "../maths/math";

export class Scene {
	static EVENT_COMPLETE = Symbol.for("scene complete");
	static EVENT_START = Symbol.for("SCENE_START");
	static TASK_RESET = Symbol.for("reset");

	public events: EventEmitter;
	public receiver: UILayer | null;
	public killOnExit: boolean;
	public bbox: BBox;
	public tasks: TaskList;
	public isRunning: boolean;
	public name: string;

	private class: string | undefined;
	private gc: GameContext;
	private screenWidth: number;
	private screenHeight: number;
	private layers: Layer[];
	private next: null;

	constructor(gc: GameContext, name: string) {
		const m = String(this.constructor).match(/class ([a-zA-Z0-9_]+)/);
		this.class = m?.[1] ?? "Scene??";

		this.gc = gc;
		this.name = name;

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
		this.killOnExit = true;
		this.next = null;

		this.tasks = new TaskList();
		this.setTaskHandlers(gc);
	}

	init(gc: GameContext) {
		for (let idx = 0; idx < this.layers.length; idx++) this.layers[idx].init?.(gc, this);
	}

	addLayer(layer: Layer) {
		this.layers.push(layer);
	}

	update(gc: GameContext) {
		for (const layer of this.layers) layer.update(gc, this);
		this.tasks.processTasks();
	}

	render(gc: GameContext) {
		// for (const layer of this.layers) layer.render(gc, this);
		for (const layer of this.layers) layer.render(gc);
	}

	pause() {
		this.isRunning = false;
	}
	run() {
		this.isRunning = true;
		this.gc.scene = this;
		this.events.emit(Scene.EVENT_START, this.name);
	}

	handleEvent(gc: GameContext, e) {
		if (this.receiver) this.receiver.handleEvent(gc, e);
	}

	addTask(name: symbol, ...args: unknown[]) {
		this.tasks.addTask(name, ...args);
	}

	setTaskHandlers(gc: GameContext) {
		// this.tasks.onTask(Scene.TASK_RESET, () => {
		// 	this.reset(gc);
		// });
	}
}
