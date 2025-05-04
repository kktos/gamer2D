import type { Entity } from "../entities/Entity";
import type { Scene } from "../scene/Scene";
import { Trait } from "./Trait";

export class XDragTrait extends Trait {
	constructor(
		public dragFactor = 400,
		public minVelocity = 0,
	) {
		super();
	}

	update({ dt }, entity: Entity, _: Scene) {
		if (entity.vel.x === 0) return;
		const absX = Math.abs(entity.vel.x);
		const decel = Math.min(absX, this.dragFactor * dt);
		const newVelocity = Math.max(absX - decel, this.minVelocity);
		entity.vel.x = entity.vel.x > 0 ? newVelocity : -newVelocity;
	}
}
