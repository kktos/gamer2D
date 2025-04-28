import type GameContext from "../game/types/GameContext";
import { createLayer } from "../layers/Layer.factory";
import { BackgroundLayer } from "../layers/background.layer";
import { DisplayLayer } from "../layers/display.layer";
import { EntitiesLayer } from "../layers/entities.layer";
import type { TSceneDisplaySheet } from "../script/compiler/layers/display/display.rules";
import { Scene } from "./Scene";

export class DisplayScene extends Scene {
	constructor(gc: GameContext, sheet: TSceneDisplaySheet) {
		super(gc, sheet.name, sheet.settings);

		this.addLayer(new BackgroundLayer(gc, this, sheet));

		if (sheet.layers) {
			for (let idx = 0; idx < sheet.layers.length; idx++) {
				const layerName = sheet.layers[idx];
				this.addLayer(createLayer(gc, layerName, this));
			}
		}

		this.receiver = new DisplayLayer(gc, this, sheet);
		this.addLayer(this.receiver);

		this.addLayer(new EntitiesLayer(gc, this, sheet));
	}
}
