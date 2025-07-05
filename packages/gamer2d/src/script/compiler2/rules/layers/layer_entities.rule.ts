import type { NeatParser } from "../../parser";
import { TNeatCommand } from "../../types/commands.type";
import { parseFor } from "../shared/for.rule";
import { parseSettings } from "../shared/settings.rule";
import { parseSprite } from "../shared/sprite.rule";

export function parseLayerEntites(parser: NeatParser) {
	parser.punct("{");

	const result: TNeatCommand[] = [];

	loop: while (parser.is("IDENTIFIER")) {
		switch (parser.peekValue()) {
			case "settings":
				result.push(parseSettings(parser));
				break;
			case "for":
				result.push(parseFor(parser));
				break;
			case "sprite":
				result.push(parseSprite(parser));
				break;
			default:
				break loop;
		}
	}

	parser.punct("}");
	return result;
}
