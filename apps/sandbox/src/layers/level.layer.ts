import {
	createVariableStore,
	type ExecutionContext,
	functions,
	type GameContext,
	type Grid,
	Layer,
	runCommands,
	type Scene,
	type TLayerLevelSheet,
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

		const settingBlocks = results.filter((result) => "type" in result && result.type === "SETTINGS");
		let settings: Record<string, unknown> = {};
		for (const block of settingBlocks) settings = { ...settings, ...(block.value as Record<string, unknown>) };
		// if (!settings) throw new SyntaxError("Missing mandatory settings for the level !?!");

		const LEVEL_GRID = gc.resourceManager.settings.get<Record<string, number>>("LEVEL_GRID");
		this.gridX = LEVEL_GRID.X;
		this.gridY = LEVEL_GRID.Y;
		this.grid = createLevelGrid(LEVEL_GRID, settings.map);
		this.levelImage = createLevelImage(LEVEL_GRID, gc.resourceManager, this.grid, settings);
	}

	render({ viewport: { ctx } }: GameContext) {
		if (this.levelImage) ctx.drawImage(this.levelImage, this.gridX, this.gridY);
	}
}
