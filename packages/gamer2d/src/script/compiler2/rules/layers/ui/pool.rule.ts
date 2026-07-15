import type { NeatParser } from "../../../parser";
import type { TNeatPoolCommand } from "../../../types/commands.type";
import { parseValueExpression } from "../../shared/value-expr.rule";

export function parsePool(parser: NeatParser) {
	parser.consume("IDENTIFIER", "pool");

	const id = parser.consume(["STRING", "IDENTIFIER"]).value as string;

	const result: Partial<TNeatPoolCommand> = { cmd: "POOL", id };

	parser.consume("PUNCT", "{");

	loop: while (parser.is("IDENTIFIER")) {
		switch (parser.peekValue()) {
			case "sprite": {
				parser.advance();
				result.spriteName = parser.string();
				break;
			}
			case "capacity": {
				parser.advance();
				result.capacity = parseValueExpression(parser);
				break;
			}
			case "traits": {
				parser.advance();
				result.traits = parseValueExpression(parser);
				break;
			}
			default:
				break loop;
		}
	}

	parser.consume("PUNCT", "}");

	if (!result.capacity || !result.spriteName) {
		throw new Error("Missing required 'capacity' or 'spriteName' argument in pool command.");
	}

	return result as TNeatPoolCommand;
}
