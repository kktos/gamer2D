import type GameContext from "../game/types/GameContext";
import { Scene } from "./Scene";

export class GameScene extends Scene {
	private currentLevel: number;
	private levelPath: string;

	constructor(gc: GameContext, filename: string, sheet) {
		super(gc, filename, sheet);

		this.isPermanent = true;
		this.currentLevel = 0;
		this.levelPath = gc.options.paths.levels;
	}

	get levelName() {
		return `level${String(this.currentLevel).padStart(3, "0")}`;
	}

	nextLevel() {
		this.currentLevel++;
		this.goto(`${this.levelPath}/${this.levelName}`);
	}

	isReadyForNextLevel() {
		return true;
	}

	update(gc: GameContext) {
		super.update(gc);

		if (this.isReadyForNextLevel()) this.nextLevel();

		return this;
	}
}
