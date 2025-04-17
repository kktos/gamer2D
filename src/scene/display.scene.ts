import type GameContext from "../game/GameContext";
import { BackgroundLayer } from "../layers/background.layer";
import { DisplayLayer } from "../layers/display.layer";
import { EntitiesLayer } from "../layers/entities.layer";
import { layerClasses } from "../layers/layers";
import { Scene } from "./Scene";
import type { SceneSheet } from "./Scene.factory";

// let t0;

export class DisplayScene extends Scene {
	constructor(gc: GameContext, name: string, sheet: SceneSheet) {
		super(gc, name);

		this.addLayer(new BackgroundLayer(gc, this, sheet.background.value));

		if (sheet.layers) {
			for (let idx = 0; idx < sheet.layers.length; idx++) {
				const layerName = sheet.layers[idx];
				if (!layerClasses[layerName]) throw new TypeError(`Unknown Layer ${layerName}`);

				this.addLayer(new layerClasses[layerName](gc, this));
			}
		}

		this.receiver = new DisplayLayer(gc, this, sheet);
		this.addLayer(this.receiver);

		this.addLayer(new EntitiesLayer(gc, this));
	}
}
