import {
	type ExecutionContext,
	type GameContext,
	type Grid,
	Layer,
	type Scene,
	type TLayerLevelSheet,
	createVariableStore,
	functions,
	runCommands,
} from "gamer2d";
import { createLevelGrid } from "../utils/createLevelGrid.utils.js";
import { createLevelImage } from "../utils/createLevelImage.utils.js";

export class LevelLayer extends Layer {
	private levelImage: HTMLCanvasElement | undefined;
	private gridX: number;
	private gridY: number;
	readonly grid: Grid;

	constructor(gc: GameContext, parent: Scene, sheet: TLayerLevelSheet) {
		super(gc, parent, "LevelLayer");

		const context: ExecutionContext = {
			variables: createVariableStore(),
			functions: functions,
			gc,
			currentScene: parent,
		};

		const results = runCommands(sheet.data, context) as { type: string; [key: string]: unknown }[];

		const [settings] = results.filter((result) => result.type === "SETTINGS") as { type: string; value: Record<string, unknown> }[];
		if (!settings) throw new SyntaxError("Missing mandatory settings for the level !?!");

		const LEVEL_GRID = gc.resourceManager.settings.get<Record<string, number>>("LEVEL_GRID");
		this.gridX = LEVEL_GRID.X;
		this.gridY = LEVEL_GRID.Y;
		this.grid = createLevelGrid(LEVEL_GRID, settings.value.map);
		this.levelImage = createLevelImage(LEVEL_GRID, gc.resourceManager, this.grid, settings.value);
	}

	render({ viewport: { ctx } }: GameContext) {
		if (this.levelImage) ctx.drawImage(this.levelImage, this.gridX, this.gridY);
	}
}
