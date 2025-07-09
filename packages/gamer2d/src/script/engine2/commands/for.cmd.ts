import type { TNeatForCommand } from "../../compiler2/types/commands.type";
import { runCommands } from "../exec";
import type { ExecutionContext } from "../exec.context";
import { evalExpressionAs } from "../expr.eval";

export function executeForCommand(command: TNeatForCommand, context: ExecutionContext) {
	const result: unknown[] = [];

	if ("var" in command) {
		// for $x of $list [as $i] { item { ... } }
		const list = evalExpressionAs(command.list, context, "array");
		for (const item of list) {
			// console.log(item);

			context.variables.setStaticLocal(command.var, item);
			if (command.index) context.variables.setStaticLocal(command.index, list.indexOf(item));
			// Execute body commands
			result.push(...runCommands(command.body, context));
		}
		context.variables.deleteLocal(command.var);
		if (command.index) context.variables.deleteLocal(command.index);
	} else {
		// for $index from,to { item { ... } }
		// Evaluate the range/list
		const startRange = evalExpressionAs(command.list[0], context, "number");
		const endRange = evalExpressionAs(command.list[1], context, "number");
		const indexVar = command.index;

		// Execute loop
		for (let i = startRange; i <= endRange; i++) {
			// Set loop variable
			context.variables.setStaticLocal(indexVar, i);

			// Execute body commands
			result.push(...runCommands(command.body, context));
		}
		context.variables.deleteLocal(indexVar);
	}
	return result;
}
