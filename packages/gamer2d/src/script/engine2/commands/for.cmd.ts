import type {
	TNeatCommand,
	TNeatForCommand,
} from "../../compiler2/types/commands.type";
import { runCommands } from "../exec";
import type { ExecutionContext } from "../exec.type";
import { evalExpressionAs } from "../expr.eval";

export function executeForCommand(
	command: TNeatForCommand,
	context: ExecutionContext,
) {
	const result: TNeatCommand[] = [];

	if ("var" in command) {
		// for $x of $list [index $i] { item { ... } }
		const list = evalExpressionAs(command.list, context, "array");
		for (const item of list) {
			console.log(item);

			context.variables.set(command.var, item);
			if (command.index)
				context.variables.set(command.index, list.indexOf(item));
			// Execute body commands
			result.push(...runCommands(command.body, context));
		}
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
			result.push(...runCommands(command.body, context));
		}
	}
	return result;
}
