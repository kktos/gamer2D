import type GameContext from "../game/GameContext";
import type { Scene } from "../scene/Scene";
import type { SceneDisplaySheet } from "../script/compiler/display/display.rules";
import type { TSceneLevelSheet } from "../script/compiler/level/level.rules";
import { Layer } from "./Layer";

export class BackgroundLayer extends Layer {
	private color: string;

	constructor(gc: GameContext, parent: Scene, sheet: TSceneLevelSheet | SceneDisplaySheet) {
		super(gc, parent);
		this.color = sheet.background?.value ?? "#000";
	}

	render({ viewport: { ctx, width, height } }) {
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, width, height);
	}
}
