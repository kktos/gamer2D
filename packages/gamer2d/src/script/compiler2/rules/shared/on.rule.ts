import type { NeatParser } from "../../parser";
import type { TNeatOnCommand } from "../../types/commands.type";
import { parseStatementsBlock } from "./statements.rule";

export function parseOn(parser: NeatParser) {
	parser.advance(); // consume "on"

	const result: TNeatOnCommand = { cmd: "ON", event: parser.consume(["STRING", "IDENTIFIER"]).rawValue, params: [], statements: [] };

	if (parser.isIdentifier("from")) {
		parser.advance();
		result.from = parser.isIdentifier() ? parser.rawIdentifier() : parser.string();
	}

	// Parse optional parameters: $id $count ...
	while (parser.is("VARIABLE")) result.params.push(parser.variable());

	result.statements = parseStatementsBlock(parser);

	return result as TNeatOnCommand;
}
