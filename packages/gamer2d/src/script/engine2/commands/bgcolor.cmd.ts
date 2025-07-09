import type { TNeatBgColorCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.context";

export function executeBgColorCommand(command: TNeatBgColorCommand, context: ExecutionContext) {
	context.currentBgColor = command.color;
}
