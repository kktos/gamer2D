import type { TEntityDefinition } from "../game/types/GameOptions";
import { getClassName } from "../utils/object.util";
import type { Entity } from ".";

// const entityClassesRegistry: Record<string, new (resourceMgr: ResourceManager, ...args: unknown[]) => Entity> = {};
const entityClassesRegistry: Record<string, new (...args: unknown[]) => Entity> = {};
const friendlyNamesToClassNameRegistry: Record<string, string> = {};

export function setupEntities(entitiesDefinitions: TEntityDefinition[]) {
	for (const def of entitiesDefinitions) setupEntity(def);
}

/**
 * Registers an entity class with the factory.
 * @param def - The entity definition.
 *            'name' is the friendly key (e.g., "sprite", "text").
 *            'classType' is the actual entity class constructor.
 */
export function setupEntity(def: TEntityDefinition) {
	const { name: friendlyName, classType } = def;
	const actualClassName = getClassName(classType); // e.g., "SpriteEntity"

	// Register the class constructor by its actual class name
	entityClassesRegistry[actualClassName] = classType;

	// If a friendly name is provided, map it to the actual class name
	if (friendlyName) friendlyNamesToClassNameRegistry[friendlyName.toLowerCase()] = actualClassName;
}

export type TBaseEntityDTO = {
	at: {
		x: number;
		y: number;
	};
	[key: string]: unknown;
};

// export function createEntityByName(nameOrAlias: string, ...args: unknown[]) {
export function createEntityByName(nameOrAlias: string, dto: TBaseEntityDTO) {
	let className: string | undefined;

	if (typeof dto !== "object" || !dto || typeof dto.at !== "object" || !dto.at || typeof dto.at.x !== "number" || typeof dto.at.y !== "number")
		throw new Error(`Invalid Entity descriptor: it needs at least a position { at : { x: 0, y: 0 } }. Received:"${JSON.stringify(dto)}"`);

	// 1. Check if nameOrAlias is a registered friendly name (alias)
	className = friendlyNamesToClassNameRegistry[nameOrAlias.toLowerCase()];

	// 2. If not an alias, check if nameOrAlias is a direct (actual) class name
	if (!className && entityClassesRegistry[nameOrAlias]) {
		className = nameOrAlias;
	}

	const EntityClassToInstantiate = className ? entityClassesRegistry[className] : undefined;

	if (EntityClassToInstantiate) {
		// return new EntityClassToInstantiate(resourceManager, ...args);
		return new EntityClassToInstantiate(dto);
	}

	// 3. Fallback: Try to create a SpriteEntity, using nameOrAlias as the sprite identifier.
	// This requires SpriteEntity to be registered under its actual class name "SpriteEntity".
	const FallbackSpriteEntityClass = entityClassesRegistry.SpriteEntity;
	if (FallbackSpriteEntityClass) {
		// 'nameOrAlias' becomes the 'sprite' parameter for SpriteEntity constructor.
		// return new FallbackSpriteEntityClass(nameOrAlias, ...args);
		return new FallbackSpriteEntityClass(nameOrAlias, dto);
	}

	throw new Error(`Entity class not found for identifier: "${nameOrAlias}". No fallback available or SpriteEntity not registered.`);
}
