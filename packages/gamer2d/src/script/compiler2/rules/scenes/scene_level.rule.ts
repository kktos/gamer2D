import type { NeatParser } from "../../parser";
import { parseLayers } from "../layers/layers.rules";
import type { TNeatLayer } from "../layers/types";
import { parseSettings } from "../shared/settings.rule";

export function parseSceneLevel(parser: NeatParser) {
	parser.consume("PUNCT", "{");

	const result: { [key: string]: unknown; layers: TNeatLayer[] } = { layers: [] };

	// scene properties
	loop: while (parser.is("IDENTIFIER")) {
		switch (parser.peek().value) {
			case "settings":
				Object.assign(result, parseSettings(parser));
				break;
			default:
				break loop;
		}
	}

	result.layers = parseLayers(parser);

	parser.consume("PUNCT", "}");
	return result;
}
