import type GameContext from "../game/types/GameContext";
import type { LayerConstructor } from "../game/types/GameOptions";
import { getClassName } from "../utils/object.util";
import type { Layer } from "./Layer";
import { BackgroundLayer } from "./background.layer";
import { DisplayLayer } from "./display.layer";
import { EntitiesLayer } from "./entities.layer";
import { WorldCollisionLayer } from "./worldcollision.layer";

const LayerClasses = {
	BackgroundLayer,
	WorldCollisionLayer,
	DisplayLayer,
	EntitiesLayer,
};

export function setupLayers(layerDefinitions: LayerConstructor[]) {
	for (const def of layerDefinitions) setupLayer(def);
}

export function setupLayer(def: LayerConstructor) {
	const className = getClassName(def);
	if (LayerClasses[className]) return;
	LayerClasses[className] = def;
}

export function createLayer(gc: GameContext, className: string, ...args: unknown[]): Layer {
	if (!LayerClasses[className]) {
		throw new TypeError(`Unknown Layer Type ${className}`);
	}
	return new LayerClasses[className](gc, ...args);
}
