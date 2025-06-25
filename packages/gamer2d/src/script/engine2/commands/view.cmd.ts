import type { TNeatViewCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";
import { evalExpression } from "../expr.eval";

export function executeViewCommand(command: TNeatViewCommand, context: ExecutionContext) {
	const _x = evalExpression(command.at.x, context);
	const _y = evalExpression(command.at.y, context);
	const _width = evalExpression(command.size.width, context);
	const _height = evalExpression(command.size.height, context);

	// Create or update view
	// context.renderer.createView(command.id, command.type, x, y, width, height);
}
