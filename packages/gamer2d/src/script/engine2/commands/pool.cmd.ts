import { EntityPool } from "../../../entities/pool.entity";
import { Events } from "../../../events";
import type { GameContext } from "../../../game";
import type { TNeatPoolCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.context";
import { evalExpressionAs } from "../expr.eval";
import { addTraits } from "./shared/add.traits";

export function executePoolCommand(command: TNeatPoolCommand, context: ExecutionContext) {
	const gc = context.gc as GameContext;

	const capacity = evalExpressionAs(command.capacity, context, "number");
	const entityPool = EntityPool.create(command.id, command.spriteName, capacity /*, { at: { x, y } }*/);

	if (command.traits) addTraits(command.traits, entityPool, context);

	gc.scene?.addTask(Events.TASK_ADD_ENTITY, entityPool);
	return entityPool;
}
