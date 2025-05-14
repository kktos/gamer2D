import type { Entity } from "../entities/Entity";
import type { GameContext } from "../game/types/GameContext";
import type { WorldCollisionLayer } from "../layers/worldcollision.layer";
import type { Scene } from "../scene/Scene";
import { Trait } from "./Trait";
/**
 * Handles Velocity, Gravity, Mass and World collisions
 *
 * Needs CollisionLayer
 */
export class PhysicsTrait extends Trait {
	update(gc: GameContext, entity: Entity, scene: Scene) {
		if (entity.isFixed) return;

		scene.useLayer("WorldCollisionLayer", (layer: WorldCollisionLayer) => {
			entity.bbox.left += entity.vel.x * gc.dt;
			layer.checkX(entity);

			entity.bbox.top += entity.vel.y * gc.dt;
			layer.checkY(entity);

			entity.vel.y += scene.gravity * entity.mass * gc.dt;
		});
	}
}
