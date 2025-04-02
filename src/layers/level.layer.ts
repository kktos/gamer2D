import ENV from "../env";
import type GameContext from "../game/GameContext";
import type { Grid } from "../maths/grid.math";
import type { Scene } from "../scene/Scene";
import { createLevelImage } from "../utils/createLevelImage.utils";
import { Layer } from "./Layer";

export class LevelLayer extends Layer {
	private levelImage: HTMLCanvasElement;

	constructor(gc: GameContext, parent: Scene, name: string, settings, grid: Grid) {
		super(gc, parent);

		this.levelImage = createLevelImage(gc.resourceManager, grid, name, settings);
	}

	render({ viewport: { ctx } }) {
		ctx.drawImage(this.levelImage, ENV.LEVEL_GRID.X, ENV.LEVEL_GRID.Y);
	}
}
