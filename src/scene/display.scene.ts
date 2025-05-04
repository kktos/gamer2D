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

		// this.addLayer(new BackgroundLayer(gc, this, sheet));
		// if (sheet.layers) {
		// 	for (let idx = 0; idx < sheet.layers.length; idx++) {
		// 		const layerName = sheet.layers[idx];
		// 		this.addLayer(createLayer(gc, layerName, this));
		// 	}
		// }
		// this.receiver = new DisplayLayer(gc, this, sheet);
		// this.addLayer(this.receiver);

		// this.addLayer(new EntitiesLayer(gc, this, sheet));
	}
}
