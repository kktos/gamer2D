import ENV from "../env";
import LocalDB from "../utils/storage.util";
import { Trait } from "./Trait";

export default class PlayerTrait extends Trait {
	static EVENT_PLAYER_KILLED = Symbol.for("playerKilled");

	lives: number;
	score: number;
	highscore: number;
	paddle: unknown;

	constructor(paddle) {
		super();

		const currentStats = LocalDB.currentPlayer();
		this.lives = currentStats.lives;
		this.score = currentStats.score;
		this.highscore = currentStats.highscore;

		this.paddle = paddle;

		// this.on(KillableTrait.EVENT_KILLED, (entity) => {
		// 	if (entity instanceof BallEntity) {
		// 		this.paddle.ballCount--;
		// 		if (this.paddle.ballCount > 0) return;
		// 		this.lives--;
		// 		this.paddle.traits.get(AnimationTrait).setAnim(this.paddle, "explosion");
		// 		this.paddle.audio.play("die").then(() => {
		// 			LocalDB.updateLives(this.lives);
		// 			this.paddle.emit(PlayerTrait.EVENT_PLAYER_KILLED, this.lives);
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

	addLife() {
		this.lives++;
		if (this.lives > ENV.MAX_LIFES) this.lives = ENV.MAX_LIFES;
		LocalDB.updateLives(this.lives);
	}
}
