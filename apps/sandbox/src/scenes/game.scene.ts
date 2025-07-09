import { GameScene } from "gamer2d/scenes/game.scene";

export class BBGameScene extends GameScene {
	isReadyForNextLevel() {
		return true;
	}
}
