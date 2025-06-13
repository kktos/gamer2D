import type { NeatParser } from "../../../parser";
import { parseAt, parseValueTuple } from "../../shared/common.rule";
import { parseValueExpression } from "../../shared/value-expr.rule";

export type TNeatSprite = {
	cmd: "SPRITE";
	name: string;
	at: { x: unknown; y: unknown };
	size?: { width: unknown; height: unknown };
	id?: string;
	anim?: string;
	dir?: string;
	traits?: unknown;
};

export function parseSprite(parser: NeatParser): unknown {
	parser.consume("IDENTIFIER", "sprite");

	const name = parser.consume(["STRING", "IDENTIFIER"]).value as string;

	const result: Partial<TNeatSprite> = { cmd: "SPRITE", name };

	loop: while (parser.is("IDENTIFIER")) {
		switch (parser.peekValue()) {
			case "at": {
				result.at = parseAt(parser);
				break;
			}
			case "size": {
				parser.advance();
				const tuple = parseValueTuple(parser);
				result.size = { width: tuple[0], height: tuple[1] };
				break;
			}
			case "id":
				parser.advance();
				result.id = parser.consume(["STRING", "IDENTIFIER"]).value as string;
				break;
			case "dir": {
				result.dir = parseDir(parser);
				break;
			}
			case "anim": {
				parser.advance();
				result.anim = parser.consume(["STRING", "IDENTIFIER"]).value as string;
				break;
			}
			case "traits":
				parser.advance();
				result.traits = parseValueExpression(parser);
				break;
			default:
				break loop;
		}
	}

	if (!result.at) {
		throw new Error("Missing required 'at' argument in sprite command.");
	}

	return result;
}

export function parseDir(parser: NeatParser) {
	parser.identifier("dir");
	return parser.identifier(["left", "right"]);
}
