import type {
	TNeatCommand,
	TNeatMenuCommand,
} from "../../compiler2/types/commands.type";
import { runCommands } from "../exec";
import type { ExecutionContext } from "../exec.type";

export function executeMenuCommand(
	command: TNeatMenuCommand,
	context: ExecutionContext,
) {
	if (command.selection) {
		if (command.selection.var) {
			context.variables.set(command.selection.var, -1);
		}
	}

	const result: TNeatCommand[] = [];
	result.push(...runCommands(command.items, context));
	return result;
}
