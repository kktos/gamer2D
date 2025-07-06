import type { GameContext } from "../game";
import { Timer } from "./timer.class";

export class TimerManager {
	static wannaLog = false;

	private stoppedTimers: Map<string, Timer>;
	private timers: Map<string, Timer>;
	private onTimer: (name: string, count: number) => void;

	constructor(onTimer: (name: string, count: number) => void) {
		this.timers = new Map();
		this.stoppedTimers = new Map();
		this.onTimer = onTimer;
	}

	// Traditional duration/repeat timer
	add(name: string, duration: number, repeatCount = 1): Timer {
		const t = new Timer(this, name, duration, repeatCount);
		this.stoppedTimers.set(name, t);
		return t;
	}

	// New array-based timer
	addArray(name: string, timingArray: number[]): Timer {
		const t = new Timer(this, name, timingArray);
		this.stoppedTimers.set(name, t);
		return t;
	}

	get(name: string): Timer | undefined {
		if (this.timers.has(name)) return this.timers.get(name);
		if (this.stoppedTimers.has(name)) return this.stoppedTimers.get(name);
		return undefined;
	}

	stop(name: string) {
		const timer = this.timers.get(name);
		if (timer) {
			this.stoppedTimers.set(name, timer);
			this.timers.delete(name);
		}
	}

	start(name: string): Timer | undefined {
		if (this.timers.has(name)) return this.timers.get(name);

		const timer = this.stoppedTimers.get(name);
		if (timer) {
			this.timers.set(name, timer);
			this.stoppedTimers.delete(name);
			return timer;
		}
		return undefined;
	}

	update(gc: GameContext) {
		for (const [name, timer] of this.timers) {
			const fired = timer.update(gc.deltaTime);

			if (fired) {
				// console.timeLog(name, "Timer.ticks - total time", timer.totalElapsed);
				// console.timeEnd(name);
				this.onTimer(name, timer.counter);
				// console.time(name);
				// console.log("-");
			}

			// Check if timer is finished
			if (timer.counter <= 0) {
				// console.timeEnd(name);
				this.stop(name);
			}
		}
	}
}
