import type { NeatParser } from "../../parser";
import type { TNeatAssignCommand } from "../../types/commands.type";
import type { TNeatConstTerm, TNeatVarTerm } from "../../types/expression.type";
import { parseValueExpression } from "./value-expr.rule";

export function parseVariableAssignment(parser: NeatParser, options?: { isConst?: boolean }): TNeatAssignCommand {
	const path: (TNeatConstTerm | TNeatVarTerm)[] = [{ type: "var", name: parser.variable() }];

	while (parser.is("PUNCT", ".")) {
		parser.advance();

		const memberToken = parser.peek();
		let memberName: TNeatConstTerm | TNeatVarTerm;

		switch (memberToken.type) {
			case "IDENTIFIER":
				memberName = { type: "const", value: parser.identifier() };
				break;
			case "VARIABLE":
				memberName = { type: "var", name: parser.variable() };
				break;
			default:
				throw new Error(`Expected identifier or variable for property access in assignment after '.', got ${memberToken.type} ${memberToken.value}`);
		}

		path.push(memberName);
	}

	parser.consume("PUNCT", "=");

	const result: TNeatAssignCommand = { cmd: "ASSIGN", name: path, value: parseValueExpression(parser) };

	if (options?.isConst) result.isConst = true;

	return result;
}
