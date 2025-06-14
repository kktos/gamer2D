import type { TNeatForCommand } from "../../compiler2/types/commands.type";
import { executeLayerUI } from "../exec";
import type { ExecutionContext } from "../exec.type";
import { evalExpressionAs } from "../expr.eval";

export function executeForCommand(command: TNeatForCommand, context: ExecutionContext) {
	if ("var" in command) {
		// for $x of $list [index $i] { item { ... } }
	} else {
		// for $index from,to { item { ... } }
		// Evaluate the range/list
		const startRange = evalExpressionAs(command.list[0], context, "number");
		const endRange = evalExpressionAs(command.list[1], context, "number");
		const indexVar = command.index;

		// Execute loop
		for (let i = startRange; i <= endRange; i++) {
			// Set loop variable
			context.variables.set(indexVar, i);

			// Execute body commands
			executeLayerUI(command.body, context);
		}
	}
}
