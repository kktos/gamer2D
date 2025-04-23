import type { entityDefinition } from "../game/Game";
import type ResourceManager from "../game/ResourceManager";
import type { Entity } from "./Entity";
import BackgroundEntity from "./background.entity";
import SpriteEntity from "./sprite.entity";
import { TextEntity } from "./text.entity";

const entityClasses = {
	BackgroundEntity,
	SpriteEntity,
	TextEntity,
};

const entityNames = {};

export function setupEntities(entitiesDefinitions: entityDefinition[]) {
	for (const def of entitiesDefinitions) {
		const { name, className, classType } = def;
		if (entityClasses[className]) continue;
		entityNames[name] = className;
		entityClasses[className] = classType;
	}
}

export function createEntity(resourceManager: ResourceManager, className: string, ...args: unknown[]): Entity {
	if (!entityClasses[className]) {
		throw new TypeError(`Unknown Entity Type ${className}`);
	}
	return new entityClasses[className](resourceManager, ...args);
}

export function createEntityByName(resourceManager: ResourceManager, name: string, ...args: unknown[]): Entity {
	const className = entityNames[name];
	if (!className) {
		throw new TypeError(`Unknown Entity Type ${name}`);
	}
	return new entityClasses[className](resourceManager, ...args);
}
