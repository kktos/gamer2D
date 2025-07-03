import type { NeatParser } from "../../../parser";
import type { TNeatRectCommand } from "../../../types/commands.type";
import { parseAt, parseValueTuple } from "../../shared/common.rule";
import { parseColor } from "../../shared/style.rule";
import { parseValueExpression } from "../../shared/value-expr.rule";

export function parseRect(parser: NeatParser) {
	parser.consume("IDENTIFIER", "rect");

	const result: Partial<TNeatRectCommand> = { cmd: "RECT" };

	loop: while (parser.is("IDENTIFIER")) {
		switch (parser.peekValue()) {
			case "at": {
				result.at = parseAt(parser);
				break;
			}
			case "size": {
				parser.advance();
				const [width, height] = parseValueTuple(parser);
				result.size = { width, height };
				break;
			}
			case "pad": {
				parser.advance();
				result.pad = parseValueTuple(parser);
				break;
			}
			case "fill": {
				result.fill = parseColor(parser).color;
				break;
			}
			case "color": {
				result.color = parseColor(parser).color;
				break;
			}
			case "anim": {
				parser.advance();
				result.anims = parseValueExpression(parser);
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

	if (!result.at || !result.size) {
		throw new Error("Missing required 'at' or 'size' argument in rect command.");
	}

	return result as TNeatRectCommand;
}
