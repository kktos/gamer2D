import type { NeatParser } from "../../parser";
import type { TNeatEmitCommand } from "../../types/commands.type";
import { parseValueExpression } from "./value-expr.rule";

export function parseEmit(parser: NeatParser) {
	parser.advance();

	const result: TNeatEmitCommand = {
		cmd: "EMIT",
		event: parser.consume(["STRING", "IDENTIFIER"]).rawValue,
		params: [],
	};

	// Parse optional arguments: ( expr1, expr2, ... )
	if (parser.isPunct("(")) {
		do {
			parser.advance();
			result.params.push(parseValueExpression(parser));
		} while (parser.isPunct(","));
		parser.punct(")");
	}

	return result as TNeatEmitCommand;
}
