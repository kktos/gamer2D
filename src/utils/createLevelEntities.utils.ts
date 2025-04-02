import type { Entity } from "../entities/Entity";
import { createEntity } from "../entities/EntityFactory";
import { entityNames } from "../entities/entities";
import type ResourceManager from "../game/ResourceManager";
import type { Grid } from "../maths/grid.math";

export function createLevelEntities(resourceManager: ResourceManager, grid: Grid, sprites) {
	const entities: Entity[] = [];
	for (const sprite of sprites) {
		const className = entityNames[sprite.name];
		const { x, y } = grid.toCoord(sprite.pos[0], sprite.pos[1]);
		const entity = createEntity(resourceManager, className, x, y, sprite.dir);
		entities.push(entity);
	}
	return entities;
}
