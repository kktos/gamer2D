import type { Entity } from "../entities/Entity";
import type { GameContext } from "../game/types/GameContext";
import { COLLISION_SIDES, type TCollisionSide } from "../utils/maths/math";
import { Trait } from "./Trait";

export class BounceTrait extends Trait {
	isBouncing: boolean;
	repulsiveFactor: number;

	constructor(repulsiveFactor = 1) {
		super();

		this.isBouncing = true;
		this.repulsiveFactor = -Math.abs(repulsiveFactor);
	}

	collides(_gc: GameContext, entity: Entity, target: Entity) {
		if (!this.isBouncing || !target.isSolid) return;

		// if(contains(target, entity)) {
		// 	console.log(`--- ${target.class} contains ${entity.class}`,target, entity);
		// 	console.log("--- PREV contains ?", entity.previousBbox);
		// }

		const side: TCollisionSide = COLLISION_SIDES.BOTTOM;
		switch (side) {
			// case COLLISION.LEFT:
			// 	entity.vel.x *= this.repulsiveFactor;
			// 	entity.left = entity.previousBbox.left;

			// 	target.vel.x *= this.repulsiveFactor;
			// 	// target.right= entity.previousBbox.right;
			// 	break;

			// case COLLISION.RIGHT:
			// 	entity.vel.x *= this.repulsiveFactor;
			// 	entity.right = target.left - 1;

			// 	target.vel.x *= this.repulsiveFactor;
			// 	break;

			// case COLLISION.TOP:
			// 	entity.vel.y *= this.repulsiveFactor;
			// 	entity.top = entity.previousBbox.top;

			// 	target.vel.y *= this.repulsiveFactor;
			// 	break;

			case COLLISION_SIDES.BOTTOM:
				entity.vel.y *= this.repulsiveFactor;
				entity.bbox.bottom = target.bbox.top - 1;

				target.vel.y *= this.repulsiveFactor;
				break;
		}
	}
}
