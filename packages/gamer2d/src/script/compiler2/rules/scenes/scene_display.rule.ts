import type { NeatParser } from "../../parser";
import type { TNeatScene } from "../../types/scenes.type";
import { parseLayers } from "../layers/layers.rules";

export function parseSceneDisplay(parser: NeatParser) {
	parser.consume("PUNCT", "{");

	const result: Partial<TNeatScene> = { layers: [] };

	// scene properties
	properties: while (parser.is("IDENTIFIER")) {
		switch (parser.peek().value) {
			case "showcursor":
				Object.assign(result, parseShowCursor(parser));
				break;
			case "debug":
				Object.assign(result, parseDebug(parser));
				break;
			default:
				break properties;
		}
	}

	result.layers = parseLayers(parser);

	parser.consume("PUNCT", "}");
	return result;
}

function parseShowCursor(parser: NeatParser) {
	parser.identifier("showcursor");
	let value = true;
	if (parser.isBoolean()) value = parser.boolean();
	return { showCursor: value };
}

function parseDebug(parser: NeatParser) {
	parser.identifier("debug");
	return { debug: parser.boolean() };
}
