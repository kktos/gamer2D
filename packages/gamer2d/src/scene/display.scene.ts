import type GameContext from "../game/types/GameContext";
import type { DisplayLayer } from "../layers/display.layer";
import type { TSceneSheet } from "../script/compiler/scenes/scene.rules";
import { Scene } from "./Scene";

export class DisplayScene extends Scene {
	constructor(gc: GameContext, filename: string, sheet: TSceneSheet) {
		super(gc, filename, sheet);

		this.useLayer("DisplayLayer", (layer: DisplayLayer) => {
			this.receiver = layer;
		});
	}
}
