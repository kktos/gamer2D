import type { TNeatItemCommand } from "../../compiler2/types/commands.type";
import { runCommands } from "../exec";
import type { ExecutionContext } from "../exec.type";

export type TNeatItemAction = {
	type: "ACTION";
	value: TNeatItemCommand[];
};

export function executeItemCommand(command: TNeatItemCommand, context: ExecutionContext) {
	const result: unknown[] = [];
	const itemParts = runCommands(command.body, context);
	result.push(itemParts);
	if (command.action) result.push({ type: "ACTION", value: command.action });
	return result;
}
