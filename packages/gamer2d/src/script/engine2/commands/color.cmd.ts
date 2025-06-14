import type { TNeatColorCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";

export function executeColorCommand(command: TNeatColorCommand, context: ExecutionContext) {
	context.currentColor = command.color;
	// context.renderer.setColor(command.color);
}
