import { type BBox, COLLISION_SIDES, DIRECTIONS, type Entity, type GameContext, type TCollisionSide, Trait } from "gamer2d";

export class ZenChanNormalBehaviourTrait extends Trait {
	private wannaChange = true;
	private newSpeed;
	private newDir;
	private newMass;
	private timeFalling = 0;
	private prevVelX = 0;
	private isFalling = true;

	constructor(
		private speed: number,
		dir,
		private mass: number,
	) {
		super();
		this.newDir = dir;
		this.newSpeed = 0; //(dir === DIRECTIONS.RIGHT ? 1 : -1) * this.speed;
		this.prevVelX = (dir === DIRECTIONS.RIGHT ? 1 : -1) * this.speed;
		this.newMass = 20;
	}

	obstructedOn(_: GameContext, entity: Entity, side: TCollisionSide, __: BBox) {
		switch (side) {
			case COLLISION_SIDES.LEFT: {
				this.wannaChange = true;
				this.newDir = DIRECTIONS.RIGHT;
				this.newSpeed = this.speed;
				break;
			}
			case COLLISION_SIDES.RIGHT: {
				this.wannaChange = true;
				this.newDir = DIRECTIONS.LEFT;
				this.newSpeed = -this.speed;
				break;
			}
			case COLLISION_SIDES.BOTTOM: {
				this.timeFalling = 0;
				if (this.isFalling) {
					this.isFalling = false;
					entity.vel.x = this.prevVelX;
					entity.mass = this.mass;
					this.newMass = this.mass;
				}
				break;
			}
		}
	}

	update(gc: GameContext, entity: Entity) {
		this.timeFalling += gc.dt;
		if (!this.isFalling && this.timeFalling > 0.1) {
			this.prevVelX = entity.vel.x;
			entity.vel.x = 0;
			this.isFalling = true;
		}

		if (this.wannaChange) {
			this.wannaChange = false;
			entity.vel.x = this.newSpeed;
			entity.dir = this.newDir;
			entity.mass = this.newMass;
		}
	}
}
