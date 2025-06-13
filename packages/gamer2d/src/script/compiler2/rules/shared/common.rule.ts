import type { NeatParser } from "../../parser";
import { parseValueExpression } from "./value-expr.rule";

export function parseValueTuple(parser: NeatParser): [unknown, unknown] {
	const x = parseValueExpression(parser);
	parser.consume("PUNCT", ",");
	const y = parseValueExpression(parser);
	return [x, y];
}

export function parseAt(parser: NeatParser) {
	parser.identifier("at");
	const tuple = parseValueTuple(parser);
	return { x: tuple[0], y: tuple[1] };
}
