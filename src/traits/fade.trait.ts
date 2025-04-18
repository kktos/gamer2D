import type { TextEntity } from "../entities/text.entity";
import Game from "../game/Game";
import type GameContext from "../game/GameContext";
import type { ArgColor } from "../types/value.types";
import { hexToRgb } from "../utils/canvas.utils";
import { Trait } from "./Trait";

export class FadeTrait extends Trait {
	static EVENT_FADED = Symbol.for("FADED");

	color: string;
	isFadein: boolean;
	alpha: number;
	isRunning: boolean;
	speed: number;

	constructor(inOrOut: "in" | "out", color: ArgColor, speed = 60) {
		super();
		const rgb = hexToRgb(color.value) || [0, 0, 0];
		this.color = `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`;
		this.isFadein = inOrOut === "in";
		this.speed = speed / 5;
		this.reset();
	}

	reset() {
		this.isRunning = true;
		this.alpha = this.isFadein ? 1 : 100;
	}

	update(gc: GameContext, entity: TextEntity) {
		if (!this.isRunning) return;
		this.alpha = this.alpha + (this.isFadein ? 1 : -1) * gc.dt * this.speed;
		if (this.isFadein) {
			if (this.alpha > 100) {
				this.isRunning = false;
				gc.scene.events.emit(FadeTrait.EVENT_FADED, this.id);
				return;
			}
		} else {
			if (this.alpha < 1) {
				this.isRunning = false;
				gc.scene.events.emit(FadeTrait.EVENT_FADED, this.id);
				return;
			}
		}
		entity.color = `rgba(${this.color}, ${Math.floor(this.alpha)}%)`;
	}
}
