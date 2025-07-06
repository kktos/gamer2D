import type { Entity } from "../entities/Entity";
import type { GameContext } from "../game/types/GameContext";
import { KillableTrait } from "./killable.trait";
import { Trait } from "./Trait";
import { setupTrait } from "./Trait.factory";

export class PlayerTrait extends Trait {
	static EVENT_PLAYER_DEAD = Symbol.for("PLAYER_DEAD");

	constructor() {
		super();

		this.on(KillableTrait.EVENT_KILLED, (_entity) => {});

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

	collides(_gc: GameContext, _entity: Entity, _target: Entity): void {
		console.log("collides", _target);
	}
}
setupTrait({ name: "PlayerTrait", alias: "Player", classType: PlayerTrait });
