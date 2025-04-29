import type ResourceManager from "../game/ResourceManager";
import type { entityDefinition } from "../game/types/GameOptions";
import { getClassName } from "../utils/object.util";
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
	for (const def of entitiesDefinitions) setupEntity(def);
}

export function setupEntity(def: entityDefinition) {
	const { name, classType } = def;
	const className = getClassName(classType);
	if (entityClasses[className]) return;
	entityNames[name] = className;
	entityClasses[className] = classType;
}

export function createEntityByName(resourceManager: ResourceManager, name: string, ...args: unknown[]): Entity {
	let className = entityNames[name];
	if (!className) className = name;
	const entityClass = entityClasses[className];
	if (entityClass) return new entityClass(resourceManager, ...args);

	className = "SpriteEntity";
	return new entityClasses[className](resourceManager, name, ...args);
	// throw new TypeError(`Unknown Entity Type ${className}`);
}
