import type { Entity } from "../entities/Entity";
import { Trait } from "./Trait";

// TODO: should use the Timers class
export default class TimerTrait extends Trait {
	static EVENT_TIMER = Symbol.for("timer");

	private totalTime: number;
	private currentTime: number;

	constructor(id: string, time = 1000) {
		super();

		this.id = id;
		this.totalTime = time;
		this.currentTime = this.totalTime;
	}

	reset() {
		this.currentTime = this.totalTime;
	}

	update({ dt, FPS }, entity: Entity) {
		this.currentTime -= (dt / FPS) * 10;

		if (this.currentTime <= 0) {
			this.reset();
			entity.queue(TimerTrait.EVENT_TIMER, this.id);
		}
	}
	// static EVENT_TIMER(EVENT_TIMER: any, id: string) {
	// 	throw new Error("Method not implemented.");
	// }
}
