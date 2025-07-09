import type { GameContext } from "../game/types/GameContext";
import type { Scene } from "../scenes/Scene";
import type { TNeatCommand } from "../script/compiler2/types/commands.type";
import { runCommands } from "../script/engine2/exec";
import type { ExecutionContext } from "../script/engine2/exec.context";
import { functions } from "../script/engine2/functions/functions.store";
import { loadSprite } from "../utils/loaders.util";
import { createVariableStore } from "../utils/vars.store";
import { Layer } from "./Layer.class";

export class BackgroundLayer extends Layer {
	private color: string;
	private images: unknown[];

	constructor(gc: GameContext, parent: Scene, sheet: { data: TNeatCommand[] }) {
		super(gc, parent, "background");

		const context: ExecutionContext = {
			variables: createVariableStore(true),
			functions,
			gc,
			currentScene: this.scene,
			currentOrigin: [
				{
					x: 0,
					y: 0,
				},
			],
		};

		this.images = runCommands(sheet.data, context);

		this.color = context.currentColor ?? "white";
	}

	render({ resourceManager, viewport: { ctx, width, height } }) {
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, width, height);
		for (const image of this.images) {
			renderImage(ctx, resourceManager, image);
		}
	}
}

function renderImage(ctx, resourceManager, image) {
	const { ss, sprite } = loadSprite({ resourceManager }, image.source.value);

	const zoom = image.zoom;
	const size = ss.spriteSize(sprite);
	const imgCanvas = document.createElement("canvas");
	imgCanvas.width = image.repeat[0] * size.width * zoom;
	imgCanvas.height = image.repeat[1] * size.height * zoom;
	const imgCtx = imgCanvas.getContext("2d") as CanvasRenderingContext2D;

	for (let row = 0; row < image.repeat[1]; row++)
		for (let col = 0; col < image.repeat[0]; col++) ss.draw(sprite, imgCtx, col * size.width * zoom, row * size.height * zoom, { flip: 0, zoom });

	ctx.drawImage(imgCanvas, image.x.value, image.y.value);
}
