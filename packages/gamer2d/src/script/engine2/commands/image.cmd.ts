import { reactiveExpression } from "../../../utils/reactive.utils";
import type { TNeatImageCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";
import { evalExpressionAs } from "../expr.eval";
import { interpolateString } from "../string.eval";

export function executeImageCommand(command: TNeatImageCommand, context: ExecutionContext) {
	const x = reactiveExpression((varsUsed) => evalExpressionAs(command.at.x, context, "number", varsUsed), context.variables);
	const y = reactiveExpression((varsUsed) => evalExpressionAs(command.at.y, context, "number", varsUsed), context.variables);

	const srcString = evalExpressionAs(command.source, context, "string");
	const source = reactiveExpression((varsUsed) => interpolateString(srcString, context, varsUsed), context.variables);

	const repeat = [1, 1];
	if (command.repeat) {
		repeat[0] = Math.max(1, evalExpressionAs(command.repeat[0], context, "number"));
		repeat[1] = Math.max(1, evalExpressionAs(command.repeat[1], context, "number"));
	}

	return { type: "IMAGE", x, y, source, repeat, zoom: context.currentZoom ?? 1 };
}
