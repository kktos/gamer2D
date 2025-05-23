import { GLOBAL_VARIABLES } from "../game/globals";
import type { GameContext } from "../game/types/GameContext";
import type { TLayerDefinition } from "../game/types/GameOptions";
import { compileLayerScript } from "../script/compiler/compiler";
import type { TLayerSheet } from "../script/compiler/layers/layer.rules";
import { getClassName } from "../utils/object.util";
import LocalDB from "../utils/storage.util";
import type { Layer } from "./Layer";
import { BackgroundLayer } from "./background.layer";
import { DisplayLayer } from "./display.layer";
import { EntitiesLayer } from "./entities.layer";
import { GlobalsLayer } from "./globals.layer";
import { WorldCollisionLayer } from "./worldcollision.layer";

const layerClasses = {};
const layerNames = {};

setupLayers([
	{ name: "background", classType: BackgroundLayer },
	{ name: "worldcollision", classType: WorldCollisionLayer },
	{ name: "display", classType: DisplayLayer },
	{ name: "entities", classType: EntitiesLayer },
	{ name: "globals", classType: GlobalsLayer },
]);

export function setupLayers(layerDefinitions: TLayerDefinition[]) {
	for (const def of layerDefinitions) {
		if (!def.classType) console.error("setupLayers: missing classType for layer", def);
		else setupLayer(def);
	}
}

export function setupLayer(def: TLayerDefinition) {
	const { name, classType } = def;
	const className = getClassName(classType);
	if (layerClasses[className]) return;
	layerNames[name] = classType;
	layerClasses[className] = classType;
}

export function createLayer(gc: GameContext, className: string, ...args: unknown[]): Layer {
	if (!layerClasses[className]) {
		throw new TypeError(`Unknown Layer type "${className}"`);
	}
	return new layerClasses[className](gc, ...args);
}

export function createLayerByName(gc: GameContext, name: string, ...args: unknown[]): Layer {
	if (!layerNames[name]) {
		throw new TypeError(`Unknown Layer type "${name}"`);
	}
	return new layerNames[name](gc, ...args);
}

export async function loadLayer(gc: GameContext, name: string) {
	let sheet: TLayerSheet | null = LocalDB.loadResource(name);
	if (!sheet) {
		try {
			const scriptText = await gc.resourceManager.loadScene(name);
			sheet = compileLayerScript(scriptText, GLOBAL_VARIABLES);
		} catch (e) {
			console.error((e as Error).message);
		}
	}
	if (!sheet) throw new Error(`Unknown Layer: "${name}"`);
	return sheet;
}
