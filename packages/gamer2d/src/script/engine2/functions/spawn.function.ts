import { createEntityByName } from "../../../entities";
import { Events } from "../../../events";
import type { Trait } from "../../../traits";
import type { ExecutionContext } from "../exec.context";

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

	const params = args[0] as SpawnParams;

	if (typeof params !== "object" || params?.type === undefined) throw new TypeError("Function spawn() expect an object like { type: '', at: { x: 0, y: 0 } }");

	const entity = createEntityByName(params.type, params);

	if (params.traits) for (const trait of params.traits) entity.addTrait(trait);

	scene?.addTask(Events.TASK_ADD_ENTITY, entity);

	return entity;
}
