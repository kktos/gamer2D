import type { NeatParser } from "../../parser";
import type { TNeatCommand } from "../../types/commands.type";
import { parseVariableAssignment } from "../shared/assign.rule";
import { parseFor } from "../shared/for.rule";
import { parseOn } from "../shared/on.rule";
import { parseSprite } from "../shared/sprite.rule";
import { parseAlign, parseBgColor, parseColor, parseFont, parseZoom } from "../shared/style.rule";
import { parseAnimation } from "./ui/animation.rule";
import { parseButton } from "./ui/button.rule";
import { parseImage } from "./ui/image.rule";
import { parseMenu } from "./ui/menu.rule";
import { parsePool } from "./ui/pool.rule";
import { parseRect } from "./ui/rect.rule";
import { parseSound } from "./ui/sound.rule";
import { parseText } from "./ui/text.rule";
import { parseTimer } from "./ui/timer.rule";
import { parseView } from "./ui/view.rule";

type LayerUiCommandHandler = (parser: NeatParser) => TNeatCommand;

const COMMAND_HANDLERS: Record<string, LayerUiCommandHandler> = {
	font: parseFont,
	align: parseAlign,
	color: parseColor,
	bgcolor: parseBgColor,
	zoom: parseZoom,
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
	timer: parseTimer,
	sound: parseSound,
	button: parseButton,
} as const;

function parseLayerUiCommand(parser: NeatParser): TNeatCommand {
	if (parser.is("VARIABLE")) return parseVariableAssignment(parser);

	const commandName = parser.peekValue();
	const handler = COMMAND_HANDLERS[ commandName as keyof typeof COMMAND_HANDLERS];
	if (!handler) throw new Error(`Unexpected UI command: ${commandName}`);

	return handler(parser);
}

export function parseLayerUi(parser: NeatParser) {
	parser.consume("PUNCT", "{");

	const result: TNeatCommand[] = [{ cmd: "CLEARCONTEXT" }];

	while (parser.is(["IDENTIFIER", "VARIABLE"])) {
		result.push(parseLayerUiCommand(parser));
	}

	parser.consume("PUNCT", "}");
	return result;
}
