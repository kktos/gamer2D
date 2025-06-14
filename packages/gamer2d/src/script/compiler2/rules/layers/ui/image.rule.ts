import type { NeatParser } from "../../../parser";
import type { TNeatImageCommand } from "../../../types/commands.type";
import { parseValueTuple } from "../../shared/common.rule";

export function parseImage(parser: NeatParser): TNeatImageCommand {
	parser.consume("IDENTIFIER", "image");

	const result: Partial<TNeatImageCommand> = { cmd: "IMAGE" };

	result.source = parser.consume(["STRING", "IDENTIFIER"]).value as string;

	while (parser.is("IDENTIFIER", ["at", "repeat"])) {
		switch (parser.peekValue()) {
			case "at": {
				parser.advance();
				const tuple = parseValueTuple(parser);
				result.at = { x: tuple[0], y: tuple[1] };
				break;
			}
			case "repeat": {
				parser.advance();
				result.repeat = parseValueTuple(parser);
				break;
			}
		}
	}

	if (!result.at) throw new Error("Missing required 'at' argument in image command.");

	return result as TNeatImageCommand;
}
