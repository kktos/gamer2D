import type { NeatParser } from "../../../parser";
import type { TNeatPoolCommand } from "../../../types/commands.type";
import { parseAt } from "../../shared/common.rule";
import { parseValueExpression } from "../../shared/value-expr.rule";

export function parsePool(parser: NeatParser) {
	parser.consume("IDENTIFIER", "pool");

	const spriteName = parser.consume(["STRING", "IDENTIFIER"]).value as string;

	const result: Partial<TNeatPoolCommand> = { cmd: "POOL", spriteName };

	loop: while (parser.is("IDENTIFIER")) {
		switch (parser.peekValue()) {
			case "at": {
				result.at = parseAt(parser);
				break;
			}
			case "count": {
				parser.advance();
				result.count = parseValueExpression(parser);
				break;
			}
			case "spawn": {
				parser.advance();
				result.spawn = parseValueExpression(parser);
				break;
			}
			case "id": {
				parser.advance();
				result.id = parser.consume(["STRING", "IDENTIFIER"]).value as string;
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

	if (!result.count || !result.id) {
		throw new Error("Missing required 'id' or 'count' argument in pool command.");
	}

	return result as TNeatPoolCommand;
}
