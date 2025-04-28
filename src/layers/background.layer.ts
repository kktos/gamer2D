import type GameContext from "../game/types/GameContext";
import type { Scene } from "../scene/Scene";
import type { TSceneDisplaySheet } from "../script/compiler/display/display.rules";
import type { TSceneLevelSheet } from "../script/compiler/level/level.rules";
import { Layer } from "./Layer";

export class BackgroundLayer extends Layer {
	private color: string;

	constructor(gc: GameContext, parent: Scene, sheet: TSceneLevelSheet | TSceneDisplaySheet) {
		super(gc, parent);
		this.color = sheet.background?.value ?? "#000";
	}

	render({ viewport: { ctx, width, height } }) {
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, width, height);
	}
}
