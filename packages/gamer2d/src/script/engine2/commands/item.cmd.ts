import type {
	TNeatCommand,
	TNeatForCommand,
} from "../../compiler2/types/commands.type";
import { runCommands } from "../exec";
import type { ExecutionContext } from "../exec.type";

export function executeItemCommand(
	command: TNeatForCommand,
	context: ExecutionContext,
) {
	const result: TNeatCommand[] = [];
	result.push(...runCommands(command.body, context));
	return result;
}
