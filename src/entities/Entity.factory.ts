import type ResourceManager from "../game/ResourceManager";
import type { TEntityDefinition } from "../game/types/GameOptions";
import { getClassName } from "../utils/object.util";
import type { Entity } from "./Entity";
import BackgroundEntity from "./background.entity";
import SpriteEntity from "./sprite.entity";
import { TextEntity } from "./text.entity";
import { ZoneEntity } from "./zone.entity";

const entityClasses = {
	BackgroundEntity,
	SpriteEntity,
	TextEntity,
	ZoneEntity,
};

const entityNames = {
	"*": "ZoneEntity",
	background: "BackgroundEntity",
	sprite: "SpriteEntity",
	text: "TextEntity",
};

export function setupEntities(entitiesDefinitions: TEntityDefinition[]) {
	for (const def of entitiesDefinitions) setupEntity(def);
}

export function setupEntity(def: TEntityDefinition) {
	const { name, classType } = def;
	const className = getClassName(classType);
	if (entityClasses[className]) return;
	entityNames[name] = className;
	entityClasses[className] = classType;
}

export function createEntityByName(resourceManager: ResourceManager, name: string, ...args: unknown[]): Entity {
	let className = entityNames[name.toLowerCase()];
	if (!className) className = name;
	const entityClass = entityClasses[className];
	if (entityClass) return new entityClass(resourceManager, ...args);

	className = "SpriteEntity";
	return new entityClasses[className](resourceManager, name, ...args);
}
