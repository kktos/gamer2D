import type { NeatParser } from "../../../parser";
import type { TNeatViewCommand } from "../../../types/commands.type";
import { parseAt, parseValueTuple } from "../../shared/common.rule";

export function parseView(parser: NeatParser) {
	parser.consume("IDENTIFIER", "view");

	const result: Partial<TNeatViewCommand> = { cmd: "VIEW", id: parser.consume(["STRING", "IDENTIFIER"]).value as string };

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
			case "type": {
				parser.advance();
				result.type = parser.consume(["STRING", "IDENTIFIER"]).value as string;
				break;
			}
			default:
				break loop;
		}
	}

	if (!result.at || !result.size || !result.type) throw new Error("Missing required 'at' or 'size' or 'type' argument in view command.");

	return result as TNeatViewCommand;
}
