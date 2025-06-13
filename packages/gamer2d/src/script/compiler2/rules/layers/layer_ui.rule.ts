import type { NeatParser } from "../../parser";
import { parseVariableAssignment } from "../shared/assign.rule";
import { parseOn } from "../shared/event.rule";
import { parseFor } from "../shared/for.rule";
import { parseAlign, parseColor, parseFont } from "../shared/style.rule";
import { parseAnimation } from "./ui/animation.rule";
import { parseImage } from "./ui/image.rule";
import { parseMenu } from "./ui/menu.rule";
import { parsePool } from "./ui/pool.rule";
import { parseRect } from "./ui/rect.rule";
import { parseSprite } from "./ui/sprite.rule";
import { parseText } from "./ui/text.rule";
import { parseView } from "./ui/view.rule";

export function parseLayerUi(parser: NeatParser) {
	parser.consume("PUNCT", "{");

	const result: unknown[] = [];

	// scene properties
	properties: while (!parser.is("PUNCT", "}")) {
		if (parser.is("IDENTIFIER"))
			switch (parser.peekValue()) {
				case "font":
					result.push(parseFont(parser));
					break;
				case "align":
					result.push(parseAlign(parser));
					break;
				case "color":
					result.push(parseColor(parser));
					break;
				case "on":
					result.push(parseOn(parser));
					break;
				case "animation":
					result.push(parseAnimation(parser));
					break;
				case "text":
					result.push(parseText(parser));
					break;
				case "menu":
					result.push(parseMenu(parser));
					break;
				case "image":
					result.push(parseImage(parser));
					break;
				case "sprite":
					result.push(parseSprite(parser));
					break;
				case "rect":
					result.push(parseRect(parser));
					break;
				case "pool":
					result.push(parsePool(parser));
					break;
				case "view":
					result.push(parseView(parser));
					break;
				case "for":
					result.push(parseFor(parser));
					break;
				default:
					break properties;
			}
		else if (parser.is("VARIABLE")) result.push(parseVariableAssignment(parser));
		else throw new Error("Invalid token");
	}

	parser.consume("PUNCT", "}");
	return result;
}
