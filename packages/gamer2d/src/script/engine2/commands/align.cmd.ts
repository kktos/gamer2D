import type { TNeatAlignCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";

export function executeAlignCommand(command: TNeatAlignCommand, context: ExecutionContext) {
	context.currentAlign = command.align;
	// context.renderer.setTextAlign(command.align);
}
