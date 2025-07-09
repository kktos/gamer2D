import type { TNeatVariablesCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.context";

export function executeVariablesCommand(command: TNeatVariablesCommand, context: ExecutionContext) {
	context.variables.setBatch(command.value);
}
