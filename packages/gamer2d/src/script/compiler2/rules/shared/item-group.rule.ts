import type { NeatParser } from "../../parser";
import type { TNeatItemCommand } from "../../types/commands.type";
import { parseText } from "../layers/ui/text.rule";
import { parseVariableAssignment } from "./assign.rule";
import { parseSprite } from "./sprite.rule";

export function parseItemGroup(parser: NeatParser): TNeatItemCommand {
	const body: TNeatItemCommand["body"] = [];

	parser.identifier("item");

	parser.consume("PUNCT", "{");
	while (!parser.is("PUNCT", "}")) {
		if (!parser.is(["IDENTIFIER", "VARIABLE"])) throw new Error("Unexpected token in item block");

		const token = parser.peek();
		switch (token.type) {
			case "IDENTIFIER":
				switch (token.value) {
					case "text":
						body.push(parseText(parser));
						break;
					case "sprite":
						body.push(parseSprite(parser));
						break;
					default:
						throw new Error("Unexpected token in item block");
				}
				break;
			case "VARIABLE":
				body.push(parseVariableAssignment(parser));
				break;
		}
	}
	parser.consume("PUNCT", "}");

	return { cmd: "ITEM", body };
}
