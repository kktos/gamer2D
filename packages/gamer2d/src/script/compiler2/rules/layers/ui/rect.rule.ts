import type { NeatParser } from "../../../parser";
import type { TNeatRectCommand } from "../../../types/commands.type";
import { parseValueTuple } from "../../shared/common.rule";
import { parseColor, parseColorValue } from "../../shared/style.rule";
import { parseValueExpression } from "../../shared/value-expr.rule";

/*
	rect x,y,w,h [pad h,v] [fill color] [color color] [paint stroke,fill] [anim expr] [traits expr]
*/
export function parseRect(parser: NeatParser) {
	parser.consume("IDENTIFIER", "rect");

	const [x, y] = parseValueTuple(parser);
	parser.consume("PUNCT", ",");
	const [width, height] = parseValueTuple(parser);

	const result: Partial<TNeatRectCommand> = { cmd: "RECT",at:{x,y},size:{width,height} };

	loop: while (parser.is("IDENTIFIER")) {
		switch (parser.peekValue()) {
			case "pad": {
				parser.advance();
				result.pad = parseValueTuple(parser);
				break;
			}
			case "paint": {
				parser.advance();
				result.color = parseColorValue(parser);
				parser.consume("PUNCT", ",");
				result.fill = parseColorValue(parser);
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

	return result as TNeatRectCommand;
}
