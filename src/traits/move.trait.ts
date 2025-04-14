import type { Entity } from "../entities/Entity";
import type { Scene } from "../scene/Scene";
import { Trait } from "./Trait";

export class MoveTrait extends Trait {
	private deceleration: number;

	constructor() {
		super();
		this.deceleration = 400;
	}

	update({ dt }, entity: Entity, scene: Scene) {
		if (entity.vel.x !== 0) {
			const absX = Math.abs(entity.vel.x);
			const decel = Math.min(absX, this.deceleration * dt);
			entity.vel.x += entity.vel.x > 0 ? -decel : decel;
		}
	}
}
