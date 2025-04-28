import type GameContext from "../game/types/GameContext";
import type { layerDefinition } from "../game/types/GameOptions";
import { getClassName } from "../utils/object.util";
import type { Layer } from "./Layer";
import { BackgroundLayer } from "./background.layer";
import { DisplayLayer } from "./display.layer";
import { EntitiesLayer } from "./entities.layer";
import { WorldCollisionLayer } from "./worldcollision.layer";

const layerClasses = {
	BackgroundLayer,
	WorldCollisionLayer,
	DisplayLayer,
	EntitiesLayer,
};
const layerNames = {};

export function setupLayers(layerDefinitions: layerDefinition[]) {
	for (const def of layerDefinitions) setupLayer(def);
}

export function setupLayer(def: layerDefinition) {
	const { name, classType } = def;
	const className = getClassName(classType);
	if (layerClasses[className]) return;
	layerNames[name] = className;
	layerClasses[className] = classType;
}

export function createLayer(gc: GameContext, className: string, ...args: unknown[]): Layer {
	if (!layerClasses[className]) {
		throw new TypeError(`Unknown Layer Type ${className}`);
	}
	return new layerClasses[className](gc, ...args);
}
