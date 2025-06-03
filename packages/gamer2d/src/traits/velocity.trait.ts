import type { Entity } from "../entities/Entity";
import { Trait } from "./Trait";

export class VelocityTrait extends Trait {
	update({ dt }, entity: Entity) {
		if (entity.isFixed) return;

		entity.bbox.setPosition(entity.vel.x * dt, entity.vel.y * dt);
	}
}
