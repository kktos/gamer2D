import { EventEmitter } from "../events/EventEmitter";
import type { TAnimation } from "../script/compiler/ressources/spritesheet.rules";

export default class Anim {
	static EVENT_END = Symbol.for("ANIM_ENDED");

	public frames: string[];
	public len: number;

	readonly name: string;
	private events: EventEmitter;
	private step: number;
	private loop: number;
	private loopInitialValue: number;
	private frameIdx = -1;
	private lastHearbeat: number | null = null;
	private isStopped = true;

	static clone(anim: Anim) {
		return new Anim(anim.name, anim as unknown as TAnimation);
	}

	constructor(name: string, sheet: TAnimation) {
		this.name = name;
		this.events = new EventEmitter();

		this.step = 0;
		this.loop = sheet.loop || Number.POSITIVE_INFINITY;
		this.len = sheet.length ?? 10;
		this.frames = [];
		if (Array.isArray(sheet.frames)) this.frames.push(...sheet.frames);
		else {
			const framesDef = sheet.frames;
			const [from, to] = framesDef.range;
			for (let idx = from; idx <= to; idx++) this.frames.push(`${framesDef.sprite}-${idx}`);
		}
		this.loopInitialValue = this.loop;
		this.reset();
	}

	backwards() {
		this.pause();
		this.frameIdx = this.frames.length;
		this.lastHearbeat = null;
		this.loop = this.loopInitialValue;
		this.step = -1;
		return this.play();
	}

	reset() {
		this.frameIdx = -1;
		this.lastHearbeat = null;
		this.loop = this.loopInitialValue;
		this.step = 1;
		return this.play();
	}
	pause() {
		this.isStopped = true;
		return this;
	}
	play() {
		return new Promise((resolve) => {
			this.isStopped = false;
			const onFinished = (anim) => {
				this.events.off(Anim.EVENT_END, onFinished);
				resolve(anim);
			};
			this.events.on(Anim.EVENT_END, onFinished);
		});
	}

	frame(time: number) {
		if (this.isStopped || !this.loop) return this.frames[this.frameIdx];

		const heartbeat = Math.floor(time / this.len) % this.frames.length;
		if (this.lastHearbeat !== heartbeat) {
			this.lastHearbeat = heartbeat;
			this.frameIdx += this.step;
			if (this.step > 0) {
				if (this.frameIdx === this.frames.length) {
					this.loop--;
					this.frameIdx = this.loop ? 0 : this.frameIdx - 1;
				}
			} else {
				if (this.frameIdx < 0) {
					this.loop--;
					this.frameIdx = this.loop ? this.frames.length - 1 : this.frameIdx + 1;
				}
			}
		}

		if (!this.loop) this.events.emit(Anim.EVENT_END, this);

		return this.frames[this.frameIdx];
	}
}
