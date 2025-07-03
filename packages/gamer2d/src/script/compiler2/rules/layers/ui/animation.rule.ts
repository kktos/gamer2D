import type { NeatParser } from "../../../parser";
import type { TNeatAnimationCommand } from "../../../types/commands.type";
import { parseStatementsBlock } from "../../shared/statements.rule";
import { parseValueExpression } from "../../shared/value-expr.rule";

export function parseAnimation(parser: NeatParser) {
	parser.identifier("animation");

	// name: IDENTIFIER or STRING
	const result: Partial<TNeatAnimationCommand> = { cmd: "ANIMATION", name: parser.name(), isPaused: false };

	// paused // do not start automagically
	if (parser.isIdentifier("paused")) {
		parser.advance();
		result.isPaused = true;
	}

	// repeat [<expression>] // expression default to Infinity
	if (parser.isIdentifier("repeat")) {
		parser.advance();
		if (parser.is("PUNCT", "{")) {
			result.repeat = [{ type: "const", value: Number.MAX_SAFE_INTEGER }];
		} else {
			result.repeat = parseValueExpression(parser);
		}
	}

	result.statements = parseStatementsBlock(parser);

	return result as TNeatAnimationCommand;
}
