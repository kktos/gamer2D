import type { NeatParser } from "../../parser";
import type { TNeatAssignCommand } from "../../types/commands.type";
import { parseVariableAssignment } from "../shared/assign.rule";

export function parseLayerGlobals(parser: NeatParser) {
	parser.consume("PUNCT", "{");

	const globals: TNeatAssignCommand[] = [];

	while (parser.is("VARIABLE")) globals.push(parseVariableAssignment(parser));

	parser.consume("PUNCT", "}");
	return globals;
}
