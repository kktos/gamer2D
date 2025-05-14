import type { Entity } from "../entities/Entity";
import type { GameContext } from "../game/types/GameContext";
import { Trait } from "./Trait";
import { KillableTrait } from "./killable.trait";

export default class PlayerTrait extends Trait {
	static EVENT_PLAYER_DEAD = Symbol.for("PLAYER_DEAD");

	constructor() {
		super();

		this.on(KillableTrait.EVENT_KILLED, (entity) => {});

		// this.on(KillableTrait.EVENT_KILLED, (entity) => {
		// 	if (entity instanceof BallEntity) {
		// 		this.paddle.ballCount--;
		// 		if (this.paddle.ballCount > 0) return;
		// 		this.lives--;
		// 		this.paddle.traits.get(AnimationTrait).setAnim(this.paddle, "explosion");
		// 		this.paddle.audio.play("die").then(() => {
		// 			LocalDB.updateLives(this.lives);
		// 			this.paddle.emit(PlayerTrait.EVENT_PLAYER_DEAD, this.lives);
		// 		});
		// 		return;
		// 	}

		// 	if (entity.points > 0 && entity.points < 1) {
		// 		// 50 * stage number (level id)
		// 		this.score += 1 / entity.points;
		// 	} else this.score += entity.points;
		// 	LocalDB.updateScore(this.score);

		// 	if (this.score > this.highscore) this.highscore = this.score;
		// });
	}

	collides(gc: GameContext, entity: Entity, target: Entity): void {}
}
