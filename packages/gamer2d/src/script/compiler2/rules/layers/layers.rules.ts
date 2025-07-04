import type { NeatParser } from "../../parser";
import type { TNeatLayer } from "../../types/layers.type";

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

export function parseLayer(parser: NeatParser) {
	parser.identifier("layer");

	const layerType = parser.identifier();
	const layer: Partial<TNeatLayer> = { type: layerType };

	if (parser.is("STRING")) layer.name = parser.string();

	layer.data = parser.invokeRule(`layer_${layerType}`);

	return layer as TNeatLayer;
}
