import type { layerDefinition } from "../game/Game";
import type GameContext from "../game/GameContext";
import type { Layer } from "./Layer";
import { BackgroundLayer } from "./background.layer";
import { CollisionLayer } from "./collision.layer";
import { DashboardLayer } from "./dashboard.layer";
import { DisplayLayer } from "./display.layer";
import { EntitiesLayer } from "./entities.layer";

const LayerClasses = {
	BackgroundLayer,
	CollisionLayer,
	DisplayLayer,
	EntitiesLayer,
	DashboardLayer,
};

export function setupLayers(layerDefinitions: layerDefinition[]) {
	for (const def of layerDefinitions) {
		const { className, classType } = def;
		if (LayerClasses[className]) continue;
		LayerClasses[className] = classType;
	}
}

export function createLayer(gc: GameContext, className: string, ...args: unknown[]): Layer {
	if (!LayerClasses[className]) {
		throw new TypeError(`Unknown Layer Type ${className}`);
	}
	return new LayerClasses[className](gc, ...args);
}
