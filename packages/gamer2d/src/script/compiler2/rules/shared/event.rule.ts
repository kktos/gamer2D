import type { NeatParser } from "../../parser";
import { parseStatementsBlock } from "./statements.rule";

export function parseOn(parser: NeatParser) {
	parser.advance(); // consume "on"
	const eventName = parser.consume(["STRING", "IDENTIFIER"]).value;

	// Parse optional parameters: $id $count ...
	const params: string[] = [];
	while (parser.is("VARIABLE")) params.push(parser.advance().value as string);

	const statements = parseStatementsBlock(parser);

	return { cmd: "ON", event: eventName, params, statements };
}
