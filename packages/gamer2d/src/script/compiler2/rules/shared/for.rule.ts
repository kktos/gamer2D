import type { PartialExcept } from "../../../../types";
import type { NeatParser } from "../../parser";
import type { TNeatCommand, TNeatForCommand, TNeatRangeForCommand, TNeatVariableForCommand } from "../../types/commands.type";
import { parseText } from "../layers/ui/text.rule";
import { parseVariableAssignment } from "./assign.rule";
import { parseValueTuple } from "./common.rule";
import { parseItemGroup } from "./item-group.rule";
import { parseSprite } from "./sprite.rule";
import { parseValueExpression } from "./value-expr.rule";

type ForCommandBuilder<T extends "variable" | "range"> = T extends "variable"
	? PartialExcept<TNeatVariableForCommand, "body" | "cmd">
	: PartialExcept<TNeatRangeForCommand, "body" | "cmd">;

function createForCommand<T extends "variable" | "range">(_type: T): ForCommandBuilder<T> {
	return { cmd: "FOR", body: [] } as ForCommandBuilder<T>;
}

export function parseFor(parser: NeatParser) {
	let result: PartialExcept<TNeatForCommand, "body" | "cmd">;

	// for $x of $list [index $i] { item { ... } }
	parser.identifier("for");
	const varName = parser.variable();

	if (parser.isIdentifier("of")) {
		parser.advance();

		result = createForCommand("variable");

		result.var = varName;
		result.list = parseValueExpression(parser);

		if (parser.isIdentifier("as")) {
			parser.advance();
			result.index = parser.variable();
		}
	} else {
		// for $index from,to { item { ... } }
		result = createForCommand("range");

		result.list = parseValueTuple(parser);
		result.index = varName;
	}

	parser.consume("PUNCT", "{");

	while (parser.is(["IDENTIFIER", "VARIABLE"])) {
		const token = parser.peek();
		switch (token.type) {
			case "IDENTIFIER": {
				switch (token.value) {
					case "item":
						result.body.push(parseItemGroup(parser) as unknown as TNeatCommand);
						break;
					case "text":
						result.body.push(parseText(parser));
						break;
					case "sprite":
						result.body.push(parseSprite(parser));
						break;
					case "const":
						parser.advance();
						result.body.push(parseVariableAssignment(parser, { isConst: true }));
						break;
				}
				break;
			}
			case "VARIABLE":
				result.body.push(parseVariableAssignment(parser));
				break;
		}
	}
	parser.consume("PUNCT", "}");

	return result as TNeatForCommand;
}
