import type { Entity } from "../entities/Entity";
import type { Scene } from "../scenes/Scene";
import { Trait } from "./Trait";
export class GravityTrait extends Trait {
	update({ dt }, entity: Entity, scene: Scene) {
		if (entity.isFixed) return;

		entity.vel.y += scene.gravity * entity.mass * dt;
	}
}
