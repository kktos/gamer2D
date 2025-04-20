import type GameContext from "../game/GameContext";
import { BackgroundLayer } from "../layers/background.layer";
import { DisplayLayer } from "../layers/display.layer";
import { EntitiesLayer } from "../layers/entities.layer";
import { layerClasses } from "../layers/layers";
import type { TEventHandlers } from "../script/compiler/display/on.rules";
import type { TSoundDefs } from "../script/compiler/display/sound.rules";
import type { ArgColor } from "../types/value.types";
import { Scene } from "./Scene";

export type SceneSheetUI = {
	pos: "top" | "bottom";
	background?: ArgColor;
};

export type SceneDisplaySheet = {
	type: "display";
	name: string;
	showCursor: boolean;
	background: ArgColor;
	layers: string[];
	ui?: SceneSheetUI;
	font: string;
	layout: unknown[];
	sounds: TSoundDefs;
	on: TEventHandlers;
	settings?: Record<string, unknown>;
};
export class DisplayScene extends Scene {
	constructor(gc: GameContext, name: string, sheet: SceneDisplaySheet) {
		super(gc, name, sheet.settings);

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

		this.addLayer(new EntitiesLayer(gc, this, [], sheet));
	}
}
