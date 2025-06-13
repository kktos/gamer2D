import type { NeatParser } from "../../../parser";
import type { TNeatTextCommand } from "../../../types/value-types";
import { parseAt, parseValueTuple } from "../../shared/common.rule";
import { parseAlign, parseFont } from "../../shared/style.rule";
import { parseValueExpression } from "../../shared/value-expr.rule";

export function parseText(parser: NeatParser) {
	parser.consume("IDENTIFIER", "text");

	const value = parseValueExpression(parser);

	const result: Partial<TNeatTextCommand> = { cmd: "TEXT", value };

	loop: while (parser.is("IDENTIFIER")) {
		switch (parser.peekValue()) {
			case "font": {
				result.font = {};
				const font = parseFont(parser);
				if (font.name) result.font.name = font.name;
				if (font.size) result.font.size = font.size;
				break;
			}
			case "size": {
				parser.advance();
				const tuple = parseValueTuple(parser);
				result.size = { width: tuple[0], height: tuple[1] };
				break;
			}
			case "at": {
				result.at = parseAt(parser);
				break;
			}
			case "id":
				parser.advance();
				result.id = parser.consume(["STRING", "IDENTIFIER"]).value as string;
				break;
			case "align":
				result.align = parseAlign(parser);
				break;
			case "nocache":
				parser.advance();
				result.nocache = true;
				break;
			case "anim":
				parser.advance();
				result.anim = parser.consume(["STRING", "IDENTIFIER"]).value as string;
				break;
			case "traits":
				parser.advance();
				result.traits = parseValueExpression(parser);
				break;
			default:
				break loop;
		}
	}

	if (!result.at) {
		throw new Error("Missing required 'at' argument in text command.");
	}

	return result;
}
