import { TimerManager } from "./timermanager.class";

export class Timer {
	public countdown: number;
	public counter: number;
	public duration: number;
	public parent: TimerManager;
	public name: string;
	public repeatCount: number;

	// New properties for array-based timing
	public timingArray: number[] | null;
	public currentIndex: number;
	public totalElapsed: number;

	constructor(parent: TimerManager, name: string, duration: number, repeatCount: number);
	constructor(parent: TimerManager, name: string, timingArray: number[]);
	constructor(parent: TimerManager, name: string, durationOrArray: number | number[], repeatCount?: number) {
		this.parent = parent;
		this.name = name;
		this.totalElapsed = 0;

		if (Array.isArray(durationOrArray)) {
			// Array-based timing mode
			this.timingArray = [...durationOrArray].map((t) => t / 1000); // Convert to seconds
			this.duration = 0;
			this.repeatCount = this.timingArray.length;
			this.currentIndex = 0;
			this.countdown = this.timingArray[0] || 0;
			this.counter = this.timingArray.length;
		} else {
			// Traditional duration/repeat mode
			this.timingArray = null;
			this.duration = durationOrArray / 1000;
			this.repeatCount = repeatCount || 1;
			this.currentIndex = 0;
			this.countdown = this.duration;
			this.counter = this.repeatCount;
		}

		if (TimerManager.wannaLog) {
			console.log("Timer.new", name, this.timingArray || `${durationOrArray}ms x${repeatCount}`);
		}
	}

	reset() {
		this.totalElapsed = 0;
		this.currentIndex = 0;

		if (this.timingArray) {
			this.countdown = this.timingArray[0] || 0;
			this.counter = this.timingArray.length;
		} else {
			this.countdown = this.duration;
			this.counter = this.repeatCount;
		}

		this.resume();
	}

	pause() {
		this.parent.stop(this.name);

		if (TimerManager.wannaLog) {
			console.log("Timer.pause", this.name);
		}
	}

	resume() {
		this.parent.start(this.name);

		// console.time(this.name);
		// console.timeLog(this.name, "Timer.resume", this.timingArray);

		if (TimerManager.wannaLog) {
			console.log("Timer.resume", this.name);
		}
	}

	private getNextCountdown(): number {
		if (!this.timingArray) return this.duration;

		let countdown: number;

		if (this.currentIndex >= this.timingArray.length) countdown = 0;
		else {
			const nextTime = this.timingArray[this.currentIndex];
			const currentTime = this.timingArray[this.currentIndex - 1];
			countdown = nextTime - currentTime;
		}
		// console.log("Timer.getNextCountdown", this.name, countdown, this.currentIndex);

		return countdown;
	}

	update(deltaTime: number) {
		this.countdown -= deltaTime;
		this.totalElapsed += deltaTime;

		if (this.countdown <= 0) {
			if (TimerManager.wannaLog) {
				console.log("Timer.ON_TIMER", this.name, "index:", this.currentIndex);
			}

			// Timer fired - move to next
			this.currentIndex++;
			this.counter--;

			if (this.counter > 0) this.countdown = this.getNextCountdown();

			return true;
		}
		return false;
	}
}
