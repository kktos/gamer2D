import type { GameContext } from "gamer2d";
import type { Entity } from "gamer2d";
import { COLLISION_SIDES, GridCell } from "gamer2d";

export class FloorGridCell extends GridCell {
	collisionY(gc: GameContext, entity: Entity) {
		if (entity.vel.y > 0) {
			if (entity.bbox.bottom > this.top) {
				entity.obstructedOn(gc, COLLISION_SIDES.BOTTOM, this);
			}
		}
	}
}
