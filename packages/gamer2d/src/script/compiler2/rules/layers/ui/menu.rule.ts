import type { PartialExcept } from "../../../../../types";
import type { NeatParser } from "../../../parser";
import type { TNeatMenuCommand } from "../../../types/commands.type";
import { parseValueTuple } from "../../shared/common.rule";
import { parseFor } from "../../shared/for.rule";
import { parseItemGroup } from "../../shared/item-group.rule";
import { parseColor } from "../../shared/style.rule";
import { parseValueExpression } from "../../shared/value-expr.rule";

export function parseMenu(parser: NeatParser) {
	parser.consume("IDENTIFIER", "menu");

	const id = parser.consume(["STRING", "IDENTIFIER"]).value as string;

	parser.consume("PUNCT", "{");

	const menu: PartialExcept<TNeatMenuCommand, "cmd" | "items"> = {
		cmd: "MENU",
		id,
		items: [],
	};

	while (!parser.is("PUNCT", "}")) {
		switch (parser.peekValue()) {
			case "selection": {
				menu.selection = parseMenuSelection(parser);
				break;
			}

			case "keys": {
				parser.advance();
				menu.keys = {};
				parser.consume("PUNCT", "{");

				while (!parser.is("PUNCT", "}")) {
					const action = parser.identifier(["previous", "next", "select"]);
					const keyList = parseValueExpression(parser);
					menu.keys[action] = keyList;
				}

				parser.consume("PUNCT", "}");
				break;
			}

			case "items": {
				parser.advance();
				parser.consume("PUNCT", "{");

				while (!parser.is("PUNCT", "}")) {
					if (parser.isIdentifier("for")) menu.items.push(parseFor(parser));
					else menu.items.push(parseItemGroup(parser));
				}

				parser.consume("PUNCT", "}");
				break;
			}

			default:
				throw new Error(`Unexpected token in menu block: ${parser.peek().type} ${parser.peek().value}`);
		}
	}

	parser.consume("PUNCT", "}");
	return menu as TNeatMenuCommand;
}

function parseMenuSelection(parser: NeatParser) {
	parser.identifier("selection");
	parser.consume("PUNCT", "{");

	const result: TNeatMenuCommand["selection"] = {};

	// scene properties
	loop: while (parser.isIdentifier()) {
		switch (parser.peekValue()) {
			// not possible atm
			// case "color":
			// 	result.color = parseColor(parser).color;
			// 	break;
			case "background":
				result.background = parseColor(parser).color;
				break;
			case "pad": {
				parser.advance();
				result.pad = parseValueTuple(parser);
				break;
			}

			default:
				break loop;
		}
	}

	parser.consume("PUNCT", "}");
	return result;
}
