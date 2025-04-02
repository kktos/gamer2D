import type ResourceManager from "../game/ResourceManager";
import type { Entity } from "./Entity";
import { entityClasses } from "./entities";

export function createEntity(resourceManager: ResourceManager, name: string, ...args: unknown[]): Entity {
	if (entityClasses[name]) {
		const entity = new entityClasses[name](resourceManager, ...args);
		return entity;
	}
	throw new TypeError(`Unknown Entity Type ${name}`);
}
