import type { Entity } from "gamer2d/entities/Entity";
import type { GameContext } from "gamer2d/game/index";
import { type KillableTrait, Trait } from "gamer2d/traits/index";
import { DIRECTIONS } from "gamer2d/types/direction.type";
import type { BBox } from "gamer2d/utils/maths/BBox.class";
import { COLLISION_SIDES, type TCollisionSide } from "gamer2d/utils/maths/math";

type ZenChanNormalBehaviourDTO = {
	speed: number;
	dir: number;
	mass: number;
};
export class ZenChanNormalBehaviourTrait extends Trait {
	private wannaChange = true;
	private newSpeed: number;
	private newDir: number;
	private newMass: number;
	private timeFalling = 0;
	private prevVelX = 0;
	public isFalling = true;
	private speed: number;
	private mass: number;

	constructor(dto: ZenChanNormalBehaviourDTO) {
		super();
		this.newDir = dto.dir;
		this.speed = dto.speed;
		this.mass = dto.mass;
		this.newSpeed = 0; //(dir === DIRECTIONS.RIGHT ? 1 : -1) * this.speed;
		this.prevVelX = (dto.dir === DIRECTIONS.RIGHT ? 1 : -1) * this.speed;
		this.newMass = 20;
	}

	collides(_: GameContext, _entity: Entity, target: Entity) {
		if (target.trait("PlayerTrait")) {
			target.useTrait("KillableTrait", (it: KillableTrait) => it.kill());
		}
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
