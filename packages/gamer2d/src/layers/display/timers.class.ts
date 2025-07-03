import type { GameContext } from "../../game/types/GameContext";

class Timer {
	public countdown: number;
	public counter: number;
	public duration: number;
	public parent: Timers;
	public name: string;
	public repeatCount: number;

	constructor(parent: Timers, name: string, duration: number, repeatCount: number) {
		this.parent = parent;
		this.name = name;
		this.duration = duration / 1000;
		this.repeatCount = repeatCount;
		this.countdown = this.duration;
		this.counter = repeatCount;

		if (Timers.wannaLog) {
			console.log("Timer.new", name, duration, repeatCount);
		}
	}

	reset() {
		this.countdown = this.duration;
		this.counter = this.repeatCount;
		this.resume();
	}

	pause() {
		this.parent.stop(this.name);

		if (Timers.wannaLog) {
			console.log("Timer.stop", this.name);
		}
	}

	resume() {
		this.parent.start(this.name);

		if (Timers.wannaLog) {
			console.log("Timer.start", this.name);
		}
	}
}

export class Timers {
	static wannaLog = false;

	private stoppedTimers: Map<string, Timer>;
	private timers: Map<string, Timer>;
	private onTimer: (name: string, count: number) => void;

	// static createTimers(sheet) {
	// 	if (typeof sheet?.timers !== "object") return null;

	// 	const obj = new Timers();
	// 	for (const [name, value] of Object.entries(sheet.timers as TTimers)) {
	// 		const repeatCount = value.repeat ?? 0;
	// 		obj.stoppedTimers.set(name, new Timer(obj, name, value.time, repeatCount));
	// 	}
	// 	return obj;
	// }

	constructor(onTimer: (name: string, count: number) => void) {
		this.timers = new Map();
		this.stoppedTimers = new Map();
		this.onTimer = onTimer;
	}

	add(name: string, duration: number, repeatCount: number) {
		const t = new Timer(this, name, duration, repeatCount);
		this.stoppedTimers.set(name, t);
		return t;
	}

	get(name: string) {
		if (this.timers.has(name)) return this.timers.get(name);

		if (this.stoppedTimers.has(name)) return this.stoppedTimers.get(name);

		return null;
	}

	stop(name: string) {
		const timer = this.timers.get(name);
		if (timer) {
			this.stoppedTimers.set(name, timer);
			this.timers.delete(name);
		}
	}

	start(name: string) {
		if (this.timers.has(name)) return this.timers.get(name);

		const timer = this.stoppedTimers.get(name);
		if (timer) {
			this.timers.set(name, timer);
			this.stoppedTimers.delete(name);
			return timer;
		}
		return null;
	}

	update(gc: GameContext) {
		for (const [name, t] of this.timers) {
			t.countdown -= gc.deltaTime;
			if (t.countdown <= 0) {
				if (Timers.wannaLog) {
					console.log("Timer.ON_TIMER", name);
				}

				this.onTimer(name, t.counter);

				t.countdown = t.duration;
				t.counter--;
				if (t.counter <= 0) this.stop(name);
			}
		}
	}
}
