import type { NeatParser } from "../../parser";
import type { TNeatAssignCommand, TNeatCallCommand } from "../../types/commands.type";
import type { TNeatExpression, TNeatTerm } from "../../types/expression.type";
import { parseVariableAssignment } from "./assign.rule";
import { parseValueExpression } from "./value-expr.rule";

export function parseStatementsBlock(parser: NeatParser) {
	parser.consume("PUNCT", "{");

	const statements: (TNeatAssignCommand | TNeatCallCommand)[] = [];
	while (parser.is(["VARIABLE", "IDENTIFIER"])) {
		switch (parser.peek().type) {
			case "VARIABLE":
				statements.push(parseVariableAssignment(parser));
				break;
			case "IDENTIFIER":
				statements.push({ cmd: "CALL", value: parseMethodCall(parser, [parseFunctionCall(parser)]) });
				break;
		}
	}

	parser.consume("PUNCT", "}");

	return statements;
}

export function parseMethodCall(parser: NeatParser, startExpr: TNeatExpression): TNeatExpression {
	const object = startExpr;
	while (parser.is("PUNCT", ".")) {
		parser.advance();
		const nextToken = parser.peek();
		switch (nextToken.type) {
			case "IDENTIFIER": {
				const name = parser.identifier();
				if (parser.is("PUNCT", "(")) {
					object.push({ type: "fn", name, args: parseCallArguments(parser) });
				} else {
					object.push({ type: "const", value: name });
					object.push({ type: "prop" });
				}
				break;
			}
			case "VARIABLE": {
				object.push({ type: "var", name: parser.variable() });
				object.push({ type: "prop" });
				break;
			}
			default:
				throw new Error(`Expected identifier or variable for property access after '.', got ${nextToken.type} ${nextToken.value}`);
		}
	}
	return object;
}

// Parses a function call: foo(...)
export function parseFunctionCall(parser: NeatParser): TNeatTerm {
	const funcName = parser.identifier();
	const args = parseCallArguments(parser);
	return { type: "fn", name: funcName, args };
}

function parseCallArguments(parser: NeatParser) {
	const args: TNeatExpression[] = [];
	parser.consume("PUNCT", "(");
	while (!parser.is("PUNCT", ")")) {
		args.push(parseValueExpression(parser));
		if (parser.is("PUNCT", ",")) parser.advance();
	}
	parser.consume("PUNCT", ")");
	return args;
}
