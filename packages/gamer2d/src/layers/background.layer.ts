import type { GameContext } from "../game/types/GameContext";
import type { Scene } from "../scene/Scene";
import type { TNeatCommand } from "../script/compiler2/types/commands.type";
import { runCommands } from "../script/engine2/exec";
import type { ExecutionContext } from "../script/engine2/exec.type";
import type { TNeatFunctions } from "../utils/functionDict.utils";
import { TVarDict, TVars } from "../utils/vars.utils";
import { Layer } from "./Layer";

export class BackgroundLayer extends Layer {
	private color: string;

	constructor(gc: GameContext, parent: Scene, sheet: { data: TNeatCommand[] }) {
		super(gc, parent, "background");
		// this.color = sheet.color.value;

		const variables: TVars = new TVars(new TVarDict());
		const context: ExecutionContext = {
			variables,
			functions: null as unknown as TNeatFunctions,
		};

		runCommands(sheet.data, context);

		this.color = context.currentColor ?? "white";
	}

	render({ viewport: { ctx, width, height } }) {
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, width, height);
	}
}
