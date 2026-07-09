import type { GameContext } from "../game/types/GameContext";
import type { UiLayer } from "../layers/ui.layer";
import type { TNeatScene } from "../script/compiler2/types/scenes.type";
import { Scene } from "./Scene";

export class DisplayScene extends Scene {
	constructor(gc: GameContext, filename: string, sheet: TNeatScene) {
		super(gc, filename, sheet);

		this.useLayer("ui", (layer: UiLayer) => {
			this.receiver = layer;
		});
	}
}
