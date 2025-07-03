import type { TNeatClearContextCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";

export function executeClearContextCommand(command: TNeatClearContextCommand, context: ExecutionContext) {
	context.currentColor = undefined;
	context.currentBgColor = undefined;
	context.currentFont = undefined;
	context.currentFontSize = undefined;
	context.currentAlign = undefined;
	context.currentVAlign = undefined;
	context.currentZoom = undefined;
}
