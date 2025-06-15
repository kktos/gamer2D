import type { PartialExcept } from "../../../../../types";
import type { NeatParser } from "../../../parser";
import type { TNeatMenuCommand } from "../../../types/commands.type";
import { parseFor } from "../../shared/for.rule";
import { parseItemGroup } from "../../shared/item-group.rule";
import { parseColor } from "../../shared/style.rule";
import { parseValueExpression } from "../../shared/value-expr.rule";

export function parseMenu(parser: NeatParser) {
	parser.consume("IDENTIFIER", "menu");

	let selectionVar: string | undefined = undefined;
	if (parser.is("VARIABLE")) selectionVar = parser.variable();

	parser.consume("PUNCT", "{");

	const menu: PartialExcept<TNeatMenuCommand, "cmd" | "items"> = {
		cmd: "MENU",
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

	if (selectionVar) {
		if (!menu.selection) menu.selection = {};
		menu.selection.var = selectionVar;
	}

	parser.consume("PUNCT", "}");
	return menu;
}

function parseMenuSelection(parser: NeatParser) {
	parser.identifier("selection");
	parser.consume("PUNCT", "{");

	const result: TNeatMenuCommand["selection"] = {};

	// scene properties
	loop: while (parser.isIdentifier()) {
		switch (parser.peekValue()) {
			case "color":
				result.color = parseColor(parser).color;
				break;
			case "background":
				result.background = parseColor(parser).color;
				break;
			case "left":
				result.left = parser.string();
				break;
			case "right":
				result.right = parser.string();
				break;
			default:
				break loop;
		}
	}

	parser.consume("PUNCT", "}");
	return result;
}
