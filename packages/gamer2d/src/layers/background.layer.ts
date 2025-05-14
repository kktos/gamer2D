import type GameContext from "../game/types/GameContext";
import type { Scene } from "../scene/Scene";
import type { TSceneBackgroundSheet } from "../script/compiler/layers/background/background.rules";
import { Layer } from "./Layer";

export class BackgroundLayer extends Layer {
	private color: string;

	constructor(gc: GameContext, parent: Scene, sheet: TSceneBackgroundSheet) {
		super(gc, parent);
		this.color = sheet.color.value;
	}

	render({ viewport: { ctx, width, height } }) {
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, width, height);
	}
}
