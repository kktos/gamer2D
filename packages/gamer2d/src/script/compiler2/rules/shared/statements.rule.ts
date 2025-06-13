import type { NeatParser } from "../../parser";
import type { TNeatInstruction } from "../../types/value-types";
import { parseVariableAssignment } from "./assign.rule";
import { parseValueExpression } from "./value-expr.rule";

export function parseStatementsBlock(parser: NeatParser) {
	parser.consume("PUNCT", "{");

	const statements: unknown[] = [];
	while (parser.is(["VARIABLE", "IDENTIFIER"])) {
		switch (parser.peek().type) {
			case "VARIABLE":
				statements.push(parseVariableAssignment(parser));
				break;
			case "IDENTIFIER":
				statements.push(parseMethodCall(parser, [parseFunctionCall(parser)]));
				break;
		}
	}

	parser.consume("PUNCT", "}");

	return statements;
}

export function parseMethodCall(parser: NeatParser, startExpr: TNeatInstruction[]): TNeatInstruction[] {
	let object = startExpr;
	while (parser.is("PUNCT", ".")) {
		parser.advance();
		const nextToken = parser.peek();
		switch (nextToken.type) {
			case "IDENTIFIER": {
				const name = parser.identifier();
				if (parser.is("PUNCT", "(")) {
					const args = parseCallArguments(parser);
					object = [...object, ...args, { type: "fn", name, args }];
				} else {
					object = [...object, { type: "const", value: name }];
				}
				break;
			}
			case "VARIABLE": {
				const name = parser.variable();
				object = [...object, { type: "var", name }];
				break;
			}
			default:
				throw new Error(`Expected identifier or variable for property access after '.', got ${nextToken.type} ${nextToken.value}`);
		}
	}
	return object;
}

// Parses a function call: foo(...)
export function parseFunctionCall(parser: NeatParser): TNeatInstruction {
	const funcName = parser.identifier();
	const args = parseCallArguments(parser);
	return { type: "fn", name: funcName, args };
}

export function parseCallArguments(parser: NeatParser) {
	const args: TNeatInstruction[] = [];
	parser.consume("PUNCT", "(");
	while (!parser.is("PUNCT", ")")) {
		args.push(...parseValueExpression(parser));
		if (parser.is("PUNCT", ",")) parser.advance();
	}
	parser.consume("PUNCT", ")");
	return args;
}
