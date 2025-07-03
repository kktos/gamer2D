import { EntityPool } from "../../../entities";
import type { GameContext } from "../../../game";
import { EntitiesLayer } from "../../../layers";
import type { TNeatPoolCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";
import { evalExpressionAs } from "../expr.eval";
import { addTraits } from "./shared/add.traits";

export function executePoolCommand(command: TNeatPoolCommand, context: ExecutionContext) {
	const gc = context.gc as GameContext;

	const x = command.at ? evalExpressionAs(command.at.x, context, "number") : 0;
	const y = command.at ? evalExpressionAs(command.at.y, context, "number") : 0;
	const count = evalExpressionAs(command.count, context, "number");
	const spawnCount = command.spawn ? evalExpressionAs(command.spawn, context, "number") : 0;

	const entityPool = EntityPool.create(gc.resourceManager, command.id, command.spriteName, count, x, y);

	if (command.traits) addTraits(command.traits, entityPool, context);

	for (let idx = 0; idx < spawnCount; idx++) entityPool.use();

	gc.scene?.addTask(EntitiesLayer.TASK_ADD_ENTITY, entityPool);
	return entityPool;
}
