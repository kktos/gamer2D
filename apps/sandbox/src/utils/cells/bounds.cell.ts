import type { GameContext } from "gamer2d";
import type { Entity } from "gamer2d";
import { COLLISION_SIDES, GridCell } from "gamer2d";

export class BoundsGridCell extends GridCell {
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
		} else if (entity.vel.y < 0) {
			if (entity.bbox.top < this.bottom) {
				entity.obstructedOn(gc, COLLISION_SIDES.TOP, this);
			}
		}
	}
}
