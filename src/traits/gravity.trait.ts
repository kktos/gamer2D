import type { Entity } from "../entities/Entity";
import type LevelScene from "../scene/level.scene";
import { Trait } from "./Trait";
export class GravityTrait extends Trait {
	update({ dt }, entity: Entity, scene: LevelScene) {
		entity.vel.y += scene.gravity * entity.mass * dt;
	}
}
