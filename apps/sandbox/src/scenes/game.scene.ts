import { type GameContext, GameScene, type TSceneSheet } from "gamer2d";

export class BBGameScene extends GameScene {
	// biome-ignore lint/complexity/noUselessConstructor: <explanation>
	constructor(gc: GameContext, filename: string, sheet: TSceneSheet) {
		super(gc, filename, sheet);
	}

	isReadyForNextLevel() {
		return true;
	}
}
