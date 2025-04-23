import { Scene } from "./Scene";

export class GameScene extends Scene {
	private currentLevel: number;

	constructor(gc, sheet) {
		super(gc, sheet.name);
		this.isPermanent = true;

		this.currentLevel = 0;

		// LocalDB.newPlayer("currentPlayer");
	}

	update(gc) {
		super.update(gc);

		this.currentLevel++;

		this.events.emit(Scene.EVENT_COMPLETE, `levels/level${String(this.currentLevel).padStart(3, "0")}`);

		return this;

		// if(!LocalDB.currentPlayer().lives || this.currentLevel > this.rounds) {
		// 	this.killOnExit= true;

		// 	if(LocalDB.isPlayerScoreGoodEnough()) {
		// 		this.events.emit(Scene.EVENT_COMPLETE, "input_name");
		// 	}
		// 	else
		// 		this.events.emit(Scene.EVENT_COMPLETE, "menu");
		// }
		// else {
		// 	LocalDB.updateRound(this.currentLevel);
		// 	this.events.emit(Scene.EVENT_COMPLETE, `levels/${this.theme}/stage${this.currentLevel}`);
		// }
	}
}
