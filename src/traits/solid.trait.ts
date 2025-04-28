import type { Entity } from "../entities/Entity";
import type GameContext from "../game/types/GameContext";
import type { GridCell } from "../maths/grid.math";
import { COLLISION_SIDES, type TCollisionSide } from "../maths/math";
import { type ITraitObstructedOn, Trait } from "./Trait";

export class SolidTrait extends Trait implements ITraitObstructedOn {
	obstructedOn(_: GameContext, entity: Entity, side: TCollisionSide, cell: GridCell) {
		switch (side) {
			case COLLISION_SIDES.LEFT:
				entity.vel.x = 0;
				entity.left = cell.right;
				break;

			case COLLISION_SIDES.RIGHT:
				entity.vel.x = 0;
				entity.right = cell.left;
				break;

			case COLLISION_SIDES.TOP:
				entity.vel.y = 0;
				entity.top = cell.bottom;
				break;

			case COLLISION_SIDES.BOTTOM:
				entity.vel.y = 0;
				entity.bottom = cell.top;
				break;
		}
	}
}
