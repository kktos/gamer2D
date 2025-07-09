import type { Entity } from "gamer2d/entities/Entity";
import type { GameContext } from "gamer2d/game/index";
import type { Scene } from "gamer2d/scenes/Scene";
import { Trait } from "gamer2d/traits/Trait";
import type { BBox } from "gamer2d/utils/maths/BBox.class";
import { COLLISION_SIDES, type TCollisionSide } from "gamer2d/utils/maths/math";

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

	update({ dt }, entity: Entity, _scene: Scene) {
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

	obstructedOn(_gc: GameContext, _entity: Entity, side: TCollisionSide, _rect: BBox) {
		if (side === COLLISION_SIDES.BOTTOM) this.readyState = 1;
	}

	get isJumping() {
		return this.readyState < 0;
	}
}
