import type { Entity } from "../entities/Entity";
import type { Scene } from "../scene/Scene";
import { Trait } from "./Trait";
export class GravityTrait extends Trait {
	update({ dt }, entity: Entity, scene: Scene) {
		entity.vel.y += scene.gravity * entity.mass * dt;
	}
}
