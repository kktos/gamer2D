import type { Entity } from "../entities/Entity";
import { createEntityByName } from "../entities/Entity.factory";
import type ResourceManager from "../game/ResourceManager";
import { GLOBAL_VARIABLES } from "../game/globals";
import { addTraits } from "../layers/display/trait.manager";
import type { Grid } from "../maths/grid.math";
import type { TEntitiesLayerSprite } from "../script/compiler/layers/entities/entities.rules";
import { TVars } from "./vars.utils";

export function createLevelEntities(resourceManager: ResourceManager, grid: Grid, sprites: TEntitiesLayerSprite[]) {
	const entities: Entity[] = [];
	if (sprites) {
		const vars = new TVars(GLOBAL_VARIABLES, GLOBAL_VARIABLES);
		for (const sprite of sprites) {
			const [x, y] = grid.toCoord(sprite.pos[0] as number, sprite.pos[1] as number);
			const entity = createEntityByName(resourceManager, sprite.name, x, y, sprite.dir);
			if (sprite.id) entity.id = sprite.id;
			if (sprite.width !== undefined) entity.bbox.width = sprite.width;
			if (sprite.height !== undefined) entity.bbox.height = sprite.height;
			if (sprite.traits) addTraits(sprite.traits, entity, vars);
			entities.push(entity);
		}
	}
	return entities;
}
