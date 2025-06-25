import { type RectDTO, RectEntity } from "../../../entities/rect.entity";
import type { GameContext } from "../../../game";
import { EntitiesLayer } from "../../../layers";
import type { TNeatRectCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";
import { evalExpressionAs } from "../expr.eval";

export function executeRectCommand(
	command: TNeatRectCommand,
	context: ExecutionContext,
): boolean {
	let x = evalExpressionAs(command.at.x, context, "number");
	let y = evalExpressionAs(command.at.y, context, "number");
	let width = evalExpressionAs(command.size.width, context, "number");
	let height = evalExpressionAs(command.size.height, context, "number");

	// Handle padding if present
	let padding = [0, 0];
	if (command.pad)
		padding = [
			evalExpressionAs(command.pad[0], context, "number"),
			evalExpressionAs(command.pad[1], context, "number"),
		];

	x = x - padding[0];
	y = y - padding[1];
	width = width + padding[0] * 2;
	height = height + padding[1] * 2;

	const color = command.color ?? context.currentColor ?? "white";

	let fill: string | undefined;
	if (command.fill) fill = command.fill;

	const gc = context.gc as GameContext;
	const rectObj: RectDTO = {
		x,
		y,
		width,
		height,
		strokecolor: color,
		fillcolor: fill,
	};
	const entity = new RectEntity(gc.resourceManager, rectObj);
	if (command.id) entity.id = command.id;

	gc.scene?.addTask(EntitiesLayer.TASK_ADD_ENTITY, entity);

	return false;
}
