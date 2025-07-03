import type { Entity } from "../../../entities";
import type { GameContext } from "../../../game";
import type { EntitiesLayer } from "../../../layers";
import type { ExecutionContext } from "../exec.type";

export function fnEntity(context: ExecutionContext, ...args: unknown[]) {
	const gc = context.gc as GameContext;
	const entityID = args[0] as string;
	let entity: Entity | undefined;
	gc.scene?.useLayer<EntitiesLayer>("entities", (layer) => {
		entity = layer.get(entityID);
	});
	return entity;
}
