import type { TAlignType } from "../../compiler2/types/align.type";
import type { TNeatAlignCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.context";

const ALIGN_NAMES = {
	left: 1,
	right: 2,
	top: 3,
	bottom: 4,
	center: 5,
};

function alignToNumber(alignName: string) {
	return ALIGN_NAMES[alignName];
}

export function executeAlignCommand(command: TNeatAlignCommand, context: ExecutionContext) {
	const align = evalAlign(command);
	context.currentAlign = align.h;
	if (align.v) context.currentVAlign = align.v;
}

export function evalAlign(command: TNeatAlignCommand) {
	const result: { h: TAlignType; v?: TAlignType } = { h: alignToNumber(command.align) };
	if (command.valign) result.v = alignToNumber(command.valign);
	return result;
}
