import type TextEntity from "../entities/text.entity";
import { hexToRgb } from "../utils/canvas.utils";
import { Trait } from "./Trait";

export class FadeTrait extends Trait {
	color: number[];
	isFadein: boolean;
	alpha: number;
	isRunning: boolean;

	constructor(inOrOut: "in" | "out", color: string) {
		super();
		this.color = hexToRgb(color) || [0, 0, 0];
		this.isFadein = inOrOut === "in";
		this.alpha = this.isFadein ? 0 : 255;
		this.isRunning = true;
	}

	update({ dt }, entity: TextEntity) {
		if (!this.isRunning) return;
		this.alpha = this.alpha + (this.isFadein ? 1 : -1) * dt * 60;
		if (this.alpha > 255 || this.alpha < 1) {
			this.isRunning = false;
			return;
		}
		entity.color = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.alpha / 255})`;
	}
}
