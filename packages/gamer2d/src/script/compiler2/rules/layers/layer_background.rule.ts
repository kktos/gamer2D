import type { NeatParser } from "../../parser";
import { parseColor } from "../shared/style.rule";

export function parseLayerBackground(parser: NeatParser) {
	parser.consume("PUNCT", "{");

	const result: unknown[] = [];

	// scene properties
	properties: while (parser.is("IDENTIFIER")) {
		switch (parser.peekValue()) {
			case "color":
				result.push(parseColor(parser));
				break;
			default:
				break properties;
		}
	}

	parser.consume("PUNCT", "}");
	return result;
}
