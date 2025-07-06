import { createEntityByName } from "../../../entities";
import { Events } from "../../../events";
import type { GameContext } from "../../../game";
import type { Trait } from "../../../traits";
import type { ExecutionContext } from "../exec.type";

type SpawnParams = {
	type: string;
	at: {
		x: number;
		y: number;
	};
	traits?: Trait[];
};

export function fnSpawn(context: ExecutionContext, ...args: unknown[]) {
	const scene = context.currentScene;
	const gc = context.gc as GameContext;

	const params = args[0] as SpawnParams;
	const entity = createEntityByName(gc.resourceManager, params.type, params);
	if (params.traits) for (const trait of params.traits) entity.addTrait(trait);

	scene?.addTask(Events.TASK_ADD_ENTITY, entity);

	return entity;
}
