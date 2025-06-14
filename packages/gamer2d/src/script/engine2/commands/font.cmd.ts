import type { TNeatFontCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";

export function executeFontCommand(command: TNeatFontCommand, context: ExecutionContext) {
	// Handle font changes
	if (command.name) {
		context.currentFont = command.name;
	}
	if (command.size) {
		context.currentFontSize = command.size;
	}

	// Apply to renderer
	// context.renderer.setFont(context.currentFont, context.currentFontSize);
}
