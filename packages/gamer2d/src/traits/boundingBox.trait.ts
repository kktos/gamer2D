import type { Entity } from "../entities/Entity";
import type { GameContext } from "../game/types/GameContext";
import type { Scene } from "../scenes/Scene";
import { Trait } from "./Trait";

export class BoundingBoxTrait extends Trait {
	update(_gc: GameContext, _entity: Entity, scene: Scene) {
		const _bbox = scene.bbox;

		// if (entity.bottom > ENV.PADDLE_Y + 10) {
		// 	if (entity.traits.has(KillableTrait)) entity.traits.get(KillableTrait).kill();
		// 	return;
		// }

		// if (entity.left < bbox.x) {
		// 	entity.left = bbox.x;
		// 	entity.vel.x *= -1;
		// }
		// if (entity.right > bbox.dx) {
		// 	entity.left = bbox.dx - entity.size.x;
		// 	entity.vel.x *= -1;
		// }

		// if (entity.top < bbox.y) {
		// 	entity.vel.y *= -1;
		// 	entity.top = bbox.y;
		// }
	}
}
