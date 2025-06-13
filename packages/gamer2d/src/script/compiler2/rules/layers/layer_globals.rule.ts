import type { NeatParser } from "../../parser";
import { parseVariableAssignment } from "../shared/assign.rule";

export function parseLayerGlobals(parser: NeatParser) {
	parser.consume("PUNCT", "{");

	const globals: { name: string; value: unknown }[] = [];

	while (parser.is("VARIABLE")) globals.push(parseVariableAssignment(parser));

	parser.consume("PUNCT", "}");
	return globals;
}
