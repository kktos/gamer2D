import type { NeatParser } from "../../parser";
import { parseSettings } from "../shared/settings.rule";

export function parseLayerLevel(parser: NeatParser) {
	parser.consume("PUNCT", "{");

	const result: unknown[] = [];

	// scene properties
	properties: while (parser.is("IDENTIFIER")) {
		switch (parser.peekValue()) {
			case "settings":
				result.push(parseSettings(parser));
				break;
			default:
				break properties;
		}
	}

	parser.consume("PUNCT", "}");
	return result;
}
