import type { TextEntity } from "../entities/text.entity";
import type { ArgColor } from "../types/value.types";
import { hexToRgb } from "../utils/canvas.utils";
import { Trait } from "./Trait";

export class FadeTrait extends Trait {
	color: number[];
	isFadein: boolean;
	alpha: number;
	isRunning: boolean;
	speed: number;

	constructor(inOrOut: "in" | "out", color: ArgColor, speed = 60) {
		super();
		this.color = hexToRgb(color.value) || [0, 0, 0];
		this.isFadein = inOrOut === "in";
		this.alpha = this.isFadein ? 1 : 255;
		this.isRunning = true;
		this.speed = speed / 10;
	}

	update({ dt }, entity: TextEntity) {
		if (!this.isRunning) return;
		this.alpha = this.alpha + (this.isFadein ? 1 : -1) * dt * this.speed;
		if (this.alpha > 255 || this.alpha < 0) {
			this.isRunning = false;
			return;
		}
		entity.color = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.alpha / 255})`;
	}
}
