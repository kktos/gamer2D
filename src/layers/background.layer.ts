import type GameContext from "../game/GameContext";
import type { Scene } from "../scene/Scene";
import { Layer } from "./Layer";

export class BackgroundLayer extends Layer {
	private color: string;

	constructor(gc: GameContext, parent: Scene, color: string) {
		super(gc, parent);
		this.color = color;
	}

	render({ viewport: { ctx, width, height } }) {
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, width, height);
	}
}
