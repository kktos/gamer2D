import type { NeatParser } from "../../../parser";
import { parseStatementsBlock } from "../../shared/statements.rule";
import { parseValueExpression } from "../../shared/value-expr.rule";

export function parseAnimation(parser: NeatParser) {
	parser.consume("IDENTIFIER", "animation");

	// name: IDENTIFIER or STRING
	const nameToken = parser.consume(["IDENTIFIER", "STRING"]);
	const name = nameToken.value as string;

	let speed: unknown = 1;
	let repeat = false;

	// parse optional 'speed' and 'repeat' in any order
	while (parser.is("IDENTIFIER")) {
		switch (parser.peekValue()) {
			case "speed":
				parser.advance();
				speed = parseValueExpression(parser);
				break;
			case "repeat":
				parser.advance();
				repeat = true;
				break;
		}
	}

	const statements = parseStatementsBlock(parser);

	return {
		cmd: "ANIMATION",
		name,
		speed,
		repeat,
		statements,
	};
}
