import type { NeatParser } from "../../parser";
import type { TNeatLayer } from "../../types/layers.type";
import { parseLayer } from "./layer.rule";

// scene layers
export function parseLayers(parser: NeatParser) {
	const result: TNeatLayer[] = [];

	while (parser.isIdentifier("layer")) {
		if (parser.isLookahead("STRING")) {
			parser.advance();
			result.push({ type: "*", path: parser.string() });
			continue;
		}

		result.push(parseLayer(parser));
	}

	return result;
}
