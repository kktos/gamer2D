import type { NeatParser } from "../../parser";
import { parseVariableAssignment } from "../shared/assign.rule";
import { parseOn } from "../shared/event.rule";
import { parseFor } from "../shared/for.rule";
import { parseSprite } from "../shared/sprite.rule";
import { parseAlign, parseColor, parseFont } from "../shared/style.rule";
import { parseAnimation } from "./ui/animation.rule";
import { parseImage } from "./ui/image.rule";
import { parseMenu } from "./ui/menu.rule";
import { parsePool } from "./ui/pool.rule";
import { parseRect } from "./ui/rect.rule";
import { parseText } from "./ui/text.rule";
import { parseView } from "./ui/view.rule";

const COMMAND_HANDLERS = {
	font: parseFont,
	align: parseAlign,
	color: parseColor,
	on: parseOn,
	animation: parseAnimation,
	text: parseText,
	menu: parseMenu,
	image: parseImage,
	sprite: parseSprite,
	rect: parseRect,
	pool: parsePool,
	view: parseView,
	for: parseFor,
} as const;

export function parseLayerUi(parser: NeatParser) {
	parser.consume("PUNCT", "{");

	const result: unknown[] = [];

	while (parser.is(["IDENTIFIER", "VARIABLE"])) {
		if (parser.is("IDENTIFIER")) {
			const commandName = parser.peekValue();
			const handler = COMMAND_HANDLERS[commandName as keyof typeof COMMAND_HANDLERS];
			if (!handler) break;
			result.push(handler(parser));
			continue;
		}
		if (parser.is("VARIABLE")) {
			result.push(parseVariableAssignment(parser));
			continue;
		}
		throw new Error("Invalid token");
	}

	parser.consume("PUNCT", "}");
	return result;
}
