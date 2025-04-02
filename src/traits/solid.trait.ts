import { COLLISION } from "../maths/math";
import { Trait } from "./Trait";

export class SolidTrait extends Trait {
	public isColliding: boolean;

	constructor() {
		super();
		this.isColliding = false;
	}
	collides(gc, side, entity) {
		switch (side) {
			case COLLISION.LEFT:
				entity.vel.x = 0;
				entity.left = entity.previousBbox.left;
				break;

			case COLLISION.RIGHT:
				entity.vel.x = 0;
				entity.right = entity.previousBbox.left + entity.size.x;
				break;

			case COLLISION.TOP:
				entity.vel.y = 0;
				entity.top = entity.previousBbox.top;
				break;

			case COLLISION.BOTTOM:
				entity.vel.y = 0;
				entity.bottom = entity.previousBbox.top + entity.size.y;
				this.isColliding = true;
				break;
		}
	}
}
