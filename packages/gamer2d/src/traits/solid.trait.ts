import type { Entity } from "../entities/Entity";
import type { GameContext } from "../game/types/GameContext";
import type { GridCell } from "../utils/maths/grid.math";
import { COLLISION_SIDES, type TCollisionSide } from "../utils/maths/math";
import { type ITraitObstructedOn, Trait } from "./Trait";

export class SolidTrait extends Trait implements ITraitObstructedOn {
	obstructedOn(_: GameContext, entity: Entity, side: TCollisionSide, cell: GridCell) {
		switch (side) {
			case COLLISION_SIDES.LEFT:
				entity.vel.x = 0;
				entity.bbox.left = cell.right;
				break;

			case COLLISION_SIDES.RIGHT:
				entity.vel.x = 0;
				entity.bbox.right = cell.left;
				break;

			case COLLISION_SIDES.TOP:
				entity.vel.y = 0;
				entity.bbox.top = cell.bottom;
				break;

			case COLLISION_SIDES.BOTTOM:
				entity.vel.y = 0;
				entity.bbox.bottom = cell.top;
				break;
		}
	}
}
