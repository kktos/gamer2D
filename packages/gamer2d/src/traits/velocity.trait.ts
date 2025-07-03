import type { Entity } from "../entities/Entity";
import { Trait } from "./Trait";

export class VelocityTrait extends Trait {
	update({ dt }, entity: Entity) {
		if (entity.isFixed) return;

		const x = entity.bbox.left;
		const y = entity.bbox.top;
		entity.bbox.setPosition(x + entity.vel.x * dt, y + entity.vel.y * dt);
	}
}
