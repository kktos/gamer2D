import type { NeatParser } from "../../parser";
import { parseFor } from "../shared/for.rule";
import { parseSettings } from "../shared/settings.rule";
import { parseSprite } from "./ui/sprite.rule";

type TNeatLayerEntities = {
	settings?: ReturnType<typeof parseSettings>["data"];
	entities?: unknown[];
};

export function parseLayerEntites(parser: NeatParser) {
	parser.consume("PUNCT", "{");

	const result: TNeatLayerEntities = {};
	const entities: unknown[] = [];

	if (parser.isIdentifier("settings")) result.settings = parseSettings(parser).data;

	loop: while (parser.is("IDENTIFIER")) {
		switch (parser.peekValue()) {
			case "for":
				entities.push(parseFor(parser));
				break;
			case "sprite":
				entities.push(parseSprite(parser));
				break;
			default:
				break loop;
		}
	}

	if (entities.length) result.entities = entities;

	parser.consume("PUNCT", "}");
	return result;
}
