import { type BBox, COLLISION_SIDES, type Entity, type GameContext, type Scene, type TCollisionSide, Trait } from "gamer2d";

export class JumpTrait extends Trait {
	private duration = 0.25;
	private velocity = 193;
	private engageTime = 0;
	private readyState = 0;
	private requestTime = 0;
	private gracePeriod = 0.1;
	private speedBoost = 0.3;

	start() {
		this.requestTime = this.gracePeriod;
	}

	cancel() {
		this.engageTime = 0;
		this.requestTime = 0;
	}

	update({ dt }, entity: Entity, scene: Scene) {
		if (this.requestTime > 0) {
			if (this.readyState > 0) {
				// entity.sounds.add("jump");
				this.engageTime = this.duration;
				this.requestTime = 0;
			}

			this.requestTime -= dt;
		}

		if (this.engageTime > 0) {
			entity.vel.y = -(this.velocity + Math.abs(entity.vel.x) * this.speedBoost);
			this.engageTime -= dt;
		}

		this.readyState -= 1;
	}

	obstructedOn(gc: GameContext, entity: Entity, side: TCollisionSide, rect: BBox) {
		if (side === COLLISION_SIDES.BOTTOM) this.readyState = 1;
	}

	get isJumping() {
		return this.readyState < 0;
	}
}
