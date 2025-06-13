import type { NeatParser } from "../../parser";

export function parseLayerWorldCollision(parser: NeatParser) {
	parser.consume("PUNCT", "{");
	parser.consume("PUNCT", "}");
	return {};
}
