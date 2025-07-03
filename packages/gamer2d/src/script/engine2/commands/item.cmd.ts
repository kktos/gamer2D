import type { TNeatItemCommand } from "../../compiler2/types/commands.type";
import { runCommands } from "../exec";
import type { ExecutionContext } from "../exec.type";

export function executeItemCommand(command: TNeatItemCommand, context: ExecutionContext) {
	const result: unknown[] = [];
	result.push(runCommands(command.body, context));
	return result;
}
