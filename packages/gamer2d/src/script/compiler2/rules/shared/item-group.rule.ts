import type { NeatParser } from "../../parser";
import type { TNeatItemCommand } from "../../types/commands.type";
import { parseText } from "../layers/ui/text.rule";
import { parseVariableAssignment } from "./assign.rule";
import { parseSprite } from "./sprite.rule";
import { parseStatementsBlock } from "./statements.rule";

export function parseItemGroup(parser: NeatParser): TNeatItemCommand {
	parser.identifier("item");

	parser.punct("{");

	const result: TNeatItemCommand = { cmd: "ITEM", body: [] };

	while (parser.is(["IDENTIFIER", "VARIABLE"])) {
		const token = parser.peek();
		switch (token.type) {
			case "IDENTIFIER":
				switch (token.value) {
					case "text":
						result.body.push(parseText(parser));
						break;
					case "sprite":
						result.body.push(parseSprite(parser));
						break;
					default:
						throw new Error("Unexpected token in item block");
				}
				break;
			case "VARIABLE":
				result.body.push(parseVariableAssignment(parser));
				break;
		}
	}

	parser.punct("}");

	if (parser.isIdentifier("action")) {
		parser.advance();
		result.action = parseStatementsBlock(parser);
	}

	return result;
}
