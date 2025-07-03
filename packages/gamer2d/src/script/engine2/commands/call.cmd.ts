import type { TNeatCallCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";
import { evalExpression } from "../expr.eval";

export function executeCallCommand(command: TNeatCallCommand, context: ExecutionContext) {
	evalExpression(command.value, context);
}
