import type { TNeatRectCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";
import { evalExpressionAs } from "../expr.eval";

export function executeRectCommand(command: TNeatRectCommand, context: ExecutionContext): boolean {
	let x = evalExpressionAs(command.at.x, context, "number");
	let y = evalExpressionAs(command.at.y, context, "number");
	let width = evalExpressionAs(command.size.width, context, "number");
	let height = evalExpressionAs(command.size.height, context, "number");

	// Handle padding if present
	let padding = [0, 0];
	if (command.pad) padding = [evalExpressionAs(command.pad[0], context, "number"), evalExpressionAs(command.pad[1], context, "number")];

	x = x - padding[0];
	y = y - padding[1];
	width = width + padding[0] * 2;
	height = height + padding[1] * 2;

	const color = command.color ?? context.currentColor ?? "white";

	let fill: string | undefined = undefined;
	if (command.fill) fill = command.fill;

	context.renderer?.drawRect(x, y, width, height, color, fill);

	return true;
}
