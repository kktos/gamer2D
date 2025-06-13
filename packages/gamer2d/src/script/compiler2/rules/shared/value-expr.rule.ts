import type { NeatParser } from "../../parser";
import type { TNeatInstruction, TNeatOperations } from "../../types/value-types";
import { parseFunctionCall, parseMethodCall } from "./statements.rule";

export function parseValueExpression(parser: NeatParser): TNeatInstruction[] {
	if (parser.is("PUNCT", "[")) return parseArrayLiteral(parser);
	if (parser.is("PUNCT", "{")) return parseObjectLiteral(parser);
	return parseExpression(parser);
}

function parseArrayLiteral(parser: NeatParser): TNeatInstruction[] {
	const arr: TNeatInstruction[] = [];
	parser.consume("PUNCT", "[");
	while (!parser.is("PUNCT", "]")) {
		arr.push(...parseValueExpression(parser));
		if (parser.is("PUNCT", ",")) parser.advance();
	}
	parser.consume("PUNCT", "]");
	return arr;
}

function parseObjectLiteral(parser: NeatParser): TNeatInstruction[] {
	const instructions: TNeatInstruction[] = [];
	parser.consume("PUNCT", "{");
	while (parser.isIdentifier()) {
		const key = parser.identifier();
		parser.consume("PUNCT", ":");
		instructions.push(...parseValueExpression(parser));
		if (parser.is("PUNCT", ",")) parser.advance();
	}
	parser.consume("PUNCT", "}");
	return instructions;
}

function parseExpression(parser: NeatParser): TNeatInstruction[] {
	let result = parseUnary(parser);
	while (parser.is("PUNCT", ["*", "+", "-", "/", "%"])) {
		const op = parser.advance().value as TNeatOperations;
		const right = parseUnary(parser);
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

function parseUnary(parser: NeatParser): TNeatInstruction[] {
	if (parser.is("PUNCT", ["-", "+", "!"])) {
		const op = parser.advance().value as TNeatOperations;
		const operand = parseUnary(parser);

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
	return parsePrimary(parser);
}

function parsePrimary(parser: NeatParser) {
	let baseExpr: TNeatInstruction[];
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
			parser.consume("PUNCT", "(");
			baseExpr = parseExpression(parser);
			parser.consume("PUNCT", ")");
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
