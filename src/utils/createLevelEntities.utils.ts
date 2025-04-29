import type { Entity } from "../entities/Entity";
import { createEntityByName } from "../entities/Entity.factory";
import type ResourceManager from "../game/ResourceManager";
import type { Grid } from "../maths/grid.math";
import type { TEntitiesLayerSprite } from "../script/compiler/layers/entities/entities.rules";

export function createLevelEntities(resourceManager: ResourceManager, grid: Grid, sprites: TEntitiesLayerSprite[]) {
	const entities: Entity[] = [];
	if (sprites)
		for (const sprite of sprites) {
			const [x, y] = grid.toCoord(sprite.pos[0] as number, sprite.pos[1] as number);
			const entity = createEntityByName(resourceManager, sprite.name, x, y, sprite.dir);
			entities.push(entity);
		}
	return entities;
}
