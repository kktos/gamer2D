import type { NeatParser } from "../../parser";
import type { TNeatForCommand, TNeatSpriteCommand } from "../../types/commands.type";
import { parseFor } from "../shared/for.rule";
import { parseSettings } from "../shared/settings.rule";
import { parseSprite } from "../shared/sprite.rule";

type TNeatLayerEntities = {
	settings: ReturnType<typeof parseSettings>["data"];
	entities: (TNeatSpriteCommand | TNeatForCommand)[];
};

export function parseLayerEntites(parser: NeatParser) {
	parser.punct("{");

	const result: TNeatLayerEntities = { settings: {}, entities: [] };

	if (parser.isIdentifier("settings")) result.settings = parseSettings(parser).data;

	loop: while (parser.is("IDENTIFIER")) {
		switch (parser.peekValue()) {
			case "for":
				result.entities.push(parseFor(parser));
				break;
			case "sprite":
				result.entities.push(parseSprite(parser));
				break;
			default:
				break loop;
		}
	}

	parser.punct("}");
	return result;
}
