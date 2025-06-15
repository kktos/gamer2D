import type { ResourceManager } from "../game/ResourceManager";
import type { TEntityDefinition } from "../game/types/GameOptions";
import { getClassName } from "../utils/object.util";
import type { Entity } from "./Entity"; // Type-only import is fine

const entityClassesRegistry: Record<string, new (resourceMgr: ResourceManager, ...args: unknown[]) => Entity> = {};
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
	if (friendlyName) {
		friendlyNamesToClassNameRegistry[friendlyName.toLowerCase()] = actualClassName;
	}
}

export function createEntityByName(resourceManager: ResourceManager, nameOrAlias: string, ...args: unknown[]): Entity {
	let className: string | undefined;

	// 1. Check if nameOrAlias is a registered friendly name (alias)
	className = friendlyNamesToClassNameRegistry[nameOrAlias.toLowerCase()];

	// 2. If not an alias, check if nameOrAlias is a direct (actual) class name
	if (!className && entityClassesRegistry[nameOrAlias]) {
		className = nameOrAlias;
	}

	const EntityClassToInstantiate = className ? entityClassesRegistry[className] : undefined;

	if (EntityClassToInstantiate) {
		return new EntityClassToInstantiate(resourceManager, ...args);
	}

	// 3. Fallback: Try to create a SpriteEntity, using nameOrAlias as the sprite identifier.
	// This requires SpriteEntity to be registered under its actual class name "SpriteEntity".
	const FallbackSpriteEntityClass = entityClassesRegistry.SpriteEntity;
	if (FallbackSpriteEntityClass) {
		// 'nameOrAlias' becomes the 'sprite' parameter for SpriteEntity constructor.
		// '...args' are expected to be x, y, etc. for the SpriteEntity.
		return new FallbackSpriteEntityClass(resourceManager, nameOrAlias, ...args);
	}

	throw new Error(`Entity class not found for identifier: "${nameOrAlias}". No fallback available or SpriteEntity not registered.`);
}
