import type { NeatParser } from "../../parser";
import type { TNeatLayer } from "../../types/layers.type";
import { parseLayers } from "../layers/layers.rules";
import { parseSettings } from "../shared/settings.rule";
import { parseDebug } from "./scene_display.rule";

export function parseSceneLevel(parser: NeatParser) {
	parser.consume("PUNCT", "{");

	const result: { [key: string]: unknown; layers: TNeatLayer[] } = { layers: [] };

	// scene properties
	loop: while (parser.is("IDENTIFIER")) {
		switch (parser.peek().value) {
			case "settings":
				Object.assign(result, parseSettings(parser));
				break;
			case "debug":
				Object.assign(result, parseDebug(parser));
				break;
			default:
				break loop;
		}
	}

	result.layers = parseLayers(parser);

	parser.consume("PUNCT", "}");
	return result;
}
