import { type GameContext, type Grid, Scene, type TSceneSheet, type WorldCollisionLayer } from "gamer2d";

export default class BBLevelScene extends Scene {
	public grid: Grid | undefined;

	constructor(gc: GameContext, filename: string, sheet: TSceneSheet) {
		super(gc, filename, sheet);

		// this.isPermanent = false;

		// this.useLayer("DisplayLayer", (layer: DisplayLayer) => {
		// 	this.receiver = layer;
		// });

		// this.useLayer("LevelLayer", (layer: LevelLayer) => {
		// 	this.grid = layer.grid;
		// });
		// this.useLayer("EntitiesLayer", (layer: EntitiesLayer) => {
		// 	if (this.grid) layer.spawnEntities(this.grid);
		// });
		this.useLayer("WorldCollisionLayer", (layer: WorldCollisionLayer) => {
			if (this.grid) layer.grid = this.grid;
		});
	}
}
