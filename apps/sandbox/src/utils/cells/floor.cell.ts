import type { Entity } from "gamer2d/entities/Entity";
import type { GameContext } from "gamer2d/game/index";
import { GridCell } from "gamer2d/utils/maths/grid.math";
import { COLLISION_SIDES } from "gamer2d/utils/maths/math";

export class FloorGridCell extends GridCell {
	collisionX(gc: GameContext, entity: Entity) {
		if (entity.vel.x > 0) {
			if (entity.bbox.right > this.left) {
				entity.obstructedOn(gc, COLLISION_SIDES.RIGHT, this);
			}
		} else if (entity.vel.x < 0) {
			if (entity.bbox.left < this.right) {
				entity.obstructedOn(gc, COLLISION_SIDES.LEFT, this);
			}
		}
	}
	collisionY(gc: GameContext, entity: Entity) {
		if (entity.vel.y > 0) {
			if (entity.bbox.bottom > this.top) {
				entity.obstructedOn(gc, COLLISION_SIDES.BOTTOM, this);
			}
		}
	}
}
