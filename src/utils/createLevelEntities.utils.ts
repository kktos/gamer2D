import type { Entity } from "../entities/Entity";
import { createEntityByName } from "../entities/EntityFactory";
import type ResourceManager from "../game/ResourceManager";
import type { Grid } from "../maths/grid.math";

export function createLevelEntities(resourceManager: ResourceManager, grid: Grid, sprites) {
	const entities: Entity[] = [];
	for (const sprite of sprites) {
		const { x, y } = grid.toCoord(sprite.pos[0], sprite.pos[1]);
		const entity = createEntityByName(resourceManager, sprite.name, x, y, sprite.dir);
		entities.push(entity);
	}
	return entities;
}
