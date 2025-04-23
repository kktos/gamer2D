import type GameContext from "../game/GameContext";
import { BackgroundLayer } from "../layers/background.layer";
import { DisplayLayer } from "../layers/display.layer";
import { EntitiesLayer } from "../layers/entities.layer";
import { layerClasses } from "../layers/layers";
import type { SceneDisplaySheet } from "../script/compiler/display/display.rules";
import { Scene } from "./Scene";

export class DisplayScene extends Scene {
	constructor(gc: GameContext, sheet: SceneDisplaySheet) {
		super(gc, sheet.name, sheet.settings);

		this.addLayer(new BackgroundLayer(gc, this, sheet));

		if (sheet.layers) {
			for (let idx = 0; idx < sheet.layers.length; idx++) {
				const layerName = sheet.layers[idx];
				if (!layerClasses[layerName]) throw new TypeError(`Unknown Layer ${layerName}`);

				this.addLayer(new layerClasses[layerName](gc, this));
			}
		}

		this.receiver = new DisplayLayer(gc, this, sheet);
		this.addLayer(this.receiver);

		this.addLayer(new EntitiesLayer(gc, this, sheet));
	}
}
