import type { NeatParser } from "../../parser";
import type { TNeatExpression, TNeatOperator } from "../../types/expression.type";
import { parseFunctionCall, parseMethodCall } from "./statements.rule";

export function parseValueExpression(parser: NeatParser): TNeatExpression {
	if (parser.is("PUNCT", "[")) return parseArrayLiteral(parser);
	if (parser.is("PUNCT", "{")) return parseObjectLiteral(parser);
	return parseAdditiveExpression(parser);
}

function parseArrayLiteral(parser: NeatParser): TNeatExpression {
	const arr: TNeatExpression[] = [];
	parser.punct("[");
	while (!parser.is("PUNCT", "]")) {
		arr.push(parseValueExpression(parser));
		if (parser.is("PUNCT", ",")) parser.punct(",");
	}
	parser.punct("]");
	return [{ type: "array", value: arr }];
}

function parseObjectLiteral(parser: NeatParser): TNeatExpression {
	const obj: Record<string, TNeatExpression> = {};
	parser.punct("{");
	while (parser.isIdentifier()) {
		const key = parser.identifier();
		parser.punct(":");
		obj[key] = parseValueExpression(parser);
		if (parser.is("PUNCT", ",")) parser.punct(",");
	}
	parser.punct("}");
	return [{ type: "object", value: obj }];
}

function parseAdditiveExpression(parser: NeatParser): TNeatExpression {
	let result = parseMultiplicativeExpression(parser);
	while (parser.is("PUNCT", ["+", "-"])) {
		const op = parser.advance().value as TNeatOperator;
		const right = parseMultiplicativeExpression(parser);
		result = [
			...result,
			...right,
			{
				type: "op",
				op,
			},
		];
	}
	return result;
}

function parseMultiplicativeExpression(parser: NeatParser): TNeatExpression {
	let result = parseUnaryExpression(parser);
	while (parser.is("PUNCT", ["*", "/", "%"])) {
		const op = parser.advance().value as TNeatOperator;
		const right = parseUnaryExpression(parser);
		result = [
			...result,
			...right,
			{
				type: "op",
				op,
			},
		];
	}
	return result;
}

function parseUnaryExpression(parser: NeatParser): TNeatExpression {
	if (parser.is("PUNCT", ["-", "+", "!"])) {
		const op = parser.advance().value as TNeatOperator;
		const operand = parseUnaryExpression(parser);

		if (op === "-" && operand.length === 1 && operand[0].type === "const" && typeof operand[0].value === "number") {
			return [{ type: "const", value: -operand[0].value }];
		}

		return [
			...operand,
			{
				type: "op",
				op: op === "+" ? "PLUS" : op === "-" ? "NEG" : "!",
			},
		];
	}
	return parsePrimaryExpression(parser);
}

function parsePrimaryExpression(parser: NeatParser) {
	let baseExpr: TNeatExpression;
	const token = parser.peek();
	switch (token.type) {
		case "NUMBER":
			baseExpr = [{ type: "const", value: parser.number() }];
			break;
		case "STRING":
			baseExpr = [{ type: "const", value: parser.string() }];
			break;
		case "COLOR":
			baseExpr = [{ type: "const", value: parser.color() }];
			break;
		case "VARIABLE":
			baseExpr = [{ type: "var", name: parser.variable() }];
			break;
		case "PUNCT": {
			parser.punct("(");
			baseExpr = parseAdditiveExpression(parser);
			parser.punct(")");
			break;
		}
		case "IDENTIFIER": {
			if (parser.isLookahead("PUNCT", "(")) {
				baseExpr = [parseFunctionCall(parser)];
				break;
			}
			baseExpr = [{ type: "const", value: parser.identifier() }];
			break;
		}
		default:
			throw new Error(`Unexpected token at start of primary expression: ${token.type} ${token.value}`);
	}

	if (parser.is("PUNCT", ".")) {
		// Parse property or method chain
		baseExpr = parseMethodCall(parser, baseExpr);
	}

	return baseExpr;
}
