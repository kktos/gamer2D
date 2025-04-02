import type { Entity } from "../entities/Entity";
import ENV from "../env";
import { Trait } from "./Trait";

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

	update({ dt }, entity: Entity) {
		this.currentTime -= ((dt * 1) / ENV.FPS) * 10;

		if (this.currentTime <= 0) {
			this.reset();
			entity.emit(TimerTrait.EVENT_TIMER, this.id);
		}
	}
	// static EVENT_TIMER(EVENT_TIMER: any, id: string) {
	// 	throw new Error("Method not implemented.");
	// }
}
