import type { NeatParser } from "../../parser";
import type { TNeatLayer, TNeatLayerLoad } from "../../types/layers.type";

export function parseLayer(parser: NeatParser) {
	parser.identifier("layer");

	const layerType = parser.identifier();
	const layer: Partial<TNeatLayer> = { type: layerType, load: [] };

	if (parser.is("STRING")) layer.name = parser.string();

	while (parser.isIdentifier("with")) {
		const block: TNeatLayerLoad = { type: "settings", path: "" };
		parser.advance();
		block.type = parser.identifier(["settings", "variables"]) as "settings" | "variables";
		parser.identifier("from");
		block.path = parser.string();
		layer.load?.push(block);
	}

	layer.data = parser.invokeRule(`layer_${layerType}`);

	return layer as TNeatLayer;
}
