import type { TNeatRectCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";
import { evalExpression, evalExpressionAs } from "../expr.eval";

export function executeRectCommand(command: TNeatRectCommand, context: ExecutionContext) {
	const x = evalExpression(command.at.x, context);
	const y = evalExpression(command.at.y, context);
	const width = evalExpression(command.size.width, context);
	const height = evalExpression(command.size.height, context);

	// Handle padding if present
	let padding = [0, 0];
	if (command.pad) padding = [evalExpressionAs(command.pad[0], context, "number"), evalExpressionAs(command.pad[1], context, "number")];

	// context.renderer.drawRect(x, y, width, height, padding);
}
