import type { NeatParser } from "../../../parser";
import { parseAt } from "../../shared/common.rule";
import { parseValueExpression } from "../../shared/value-expr.rule";

export type TNeatPool = {
	cmd: "POOL";
	name: string;
	at: { x: unknown; y: unknown };
	count: unknown;
	id?: string;
	spawn?: unknown;
};

export function parsePool(parser: NeatParser) {
	parser.consume("IDENTIFIER", "pool");

	const name = parser.consume(["STRING", "IDENTIFIER"]).value as string;

	const result: Partial<TNeatPool> = { cmd: "POOL", name };

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
			case "id":
				parser.advance();
				result.id = parser.consume(["STRING", "IDENTIFIER"]).value as string;
				break;
			default:
				break loop;
		}
	}

	if (!result.at) {
		throw new Error("Missing required 'at' argument in pool command.");
	}

	return result;
}
