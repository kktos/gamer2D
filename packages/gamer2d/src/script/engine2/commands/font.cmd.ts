import { Font } from "../../../game";
import type { TNeatFontCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";

export function executeFontCommand(command: TNeatFontCommand, context: ExecutionContext) {
	const font = evalFont(command);

	if (font.font) context.currentFont = font.font;
	if (font.size) context.currentFontSize = command.size;
}

export function evalFont(command: { name?: string; size?: number }) {
	const result: { font?: Font; size?: number } = {};
	if (command.name) {
		const font = Font.get(command.name);
		if (font === undefined) throw new Error(`Font ${command.name} not found`);
		result.font = font;
	}
	if (command.size) result.size = command.size;
	return result;
}
