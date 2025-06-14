import type { TNeatTextCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";
import { evalExpression } from "../expr.eval";
import { executeAlignCommand } from "./align.cmd";

export function executeTextCommand(command: TNeatTextCommand, context: ExecutionContext) {
	// Evaluate the text value (could be variables, expressions)
	const text = evalExpression(command.value, context);

	// Evaluate position
	const x = evalExpression(command.at.x, context);
	const y = evalExpression(command.at.y, context);

	// Handle inline alignment if present
	if (command.align) {
		executeAlignCommand(command.align, context);
	}

	// Render the text
	// context.renderer.drawText(text, x, y);
}
