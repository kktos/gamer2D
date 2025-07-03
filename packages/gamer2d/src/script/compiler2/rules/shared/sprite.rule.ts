import type { PartialExcept } from "../../../../types";
import type { NeatParser } from "../../parser";
import type { TNeatSpriteCommand } from "../../types/commands.type";
import { parseAt, parseValueTuple } from "./common.rule";
import { parseValueExpression } from "./value-expr.rule";

export function parseSprite(parser: NeatParser) {
	parser.consume("IDENTIFIER", "sprite");

	const name = parseValueExpression(parser);

	const result: PartialExcept<TNeatSpriteCommand, "cmd" | "name"> = { cmd: "SPRITE", name };

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
				parser.advance();
				result.dir = parser.identifier(["left", "right"]);
				break;
			}
			case "anim": {
				parser.advance();
				result.anims = parseValueExpression(parser);
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

	return result as TNeatSpriteCommand;
}
