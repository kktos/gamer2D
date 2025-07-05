import { type GameContext, type Grid, Scene, type TSceneSheet, type WorldCollisionLayer } from "gamer2d";
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
