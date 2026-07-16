import type { NeatParser } from "../../parser";
import type { TNeatTerm } from "../../types/expression.type";
import { parseAdditiveExpression, parseValueExpression } from "./value-expr.rule";

export function parseValueTuple(parser: NeatParser): [TNeatTerm[], TNeatTerm[]] {
	const x = parseValueExpression(parser);
	parser.consume("PUNCT", ",");
	const y = parseValueExpression(parser);
	return [x, y];
}

export function parseAt(parser: NeatParser) {
	parser.identifier("at");
	const x = parseAdditiveExpression(parser);
	parser.consume("PUNCT", ",");
	const y = parseValueExpression(parser);
	return { x, y };
}
