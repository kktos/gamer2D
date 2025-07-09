import type { GameContext } from "gamer2d/game/index";
import type { WorldCollisionLayer } from "gamer2d/layers/worldcollision.layer";
import { Scene } from "gamer2d/scenes/Scene";
import type { Grid } from "gamer2d/utils/maths/grid.math";
import type { LevelLayer } from "../layers/level.layer.js";

export default class BBLevelScene extends Scene {
	public grid: Grid | undefined;

	constructor(gc: GameContext, filename: string, sheet: TSceneSheet) {
		super(gc, filename, sheet);

		this.isPermanent = false;

		// this.useLayer("DisplayLayer", (layer: DisplayLayer) => {
		// 	this.receiver = layer;
		// });

		this.useLayer("level", (layer: LevelLayer) => {
			this.grid = layer.grid;
		});
		this.useLayer("worldcollision", (layer: WorldCollisionLayer) => {
			if (this.grid) layer.grid = this.grid;
		});
	}
}
