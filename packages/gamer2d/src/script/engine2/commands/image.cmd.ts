import type { TNeatImageCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";
import { evalExpressionAs } from "../expr.eval";

export function executeImageCommand(command: TNeatImageCommand, context: ExecutionContext) {
	const _x = evalExpressionAs(command.at.x, context, "number");
	const _y = evalExpressionAs(command.at.y, context, "number");
	const _source = command.source;
	const repeat = [1, 1];
	if (command.repeat) {
		repeat[0] = evalExpressionAs(command.repeat[0], context, "number");
		repeat[1] = evalExpressionAs(command.repeat[1], context, "number");
	}

	// context.renderer.drawRect(x, y, width, height, padding);
}
