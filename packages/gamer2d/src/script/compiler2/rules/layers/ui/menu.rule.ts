import type { NeatParser } from "../../../parser";
import { parseFor } from "../../shared/for.rule";
import { parseItemGroup } from "../../shared/item-group.rule";
import { parseColor, parseFont } from "../../shared/style.rule";
import { parseValueExpression } from "../../shared/value-expr.rule";

export function parseMenu(parser: NeatParser) {
	parser.consume("IDENTIFIER", "menu");
	parser.consume("PUNCT", "{");

	const menu: Record<string, unknown> = {
		cmd: "MENU",
		style: null,
		selection: null,
		keys: null,
		items: [],
	};

	while (!parser.is("PUNCT", "}")) {
		switch (parser.peekValue()) {
			case "style": {
				menu.style = parseMenuStyle(parser);
				break;
			}

			case "selection": {
				menu.selection = parseMenuSelection(parser);
				break;
			}

			case "keys": {
				parser.advance();
				parser.consume("PUNCT", "{");
				const keys: Record<string, unknown> = {};
				while (!parser.is("PUNCT", "}")) {
					const action = parser.identifier(["previous", "next", "select"]);
					const keyList = parseValueExpression(parser);
					keys[action] = keyList;
				}
				parser.consume("PUNCT", "}");
				menu.keys = keys;
				break;
			}

			case "items": {
				parser.advance();
				parser.consume("PUNCT", "{");
				const items: unknown[] = [];

				while (!parser.is("PUNCT", "}")) {
					if (parser.isIdentifier("for")) items.push(parseFor(parser));
					else items.push(parseItemGroup(parser));
				}

				parser.consume("PUNCT", "}");
				menu.items = items;
				break;
			}

			default:
				throw new Error(`Unexpected token in menu block: ${parser.peek().type} ${parser.peek().value}`);
		}
	}

	parser.consume("PUNCT", "}");
	return menu;
}

type TNeatMenuStyle = {
	color?: unknown;
	font?: { name?: string; size?: number };
};

function parseMenuStyle(parser: NeatParser) {
	parser.identifier("style");
	parser.consume("PUNCT", "{");

	const result: TNeatMenuStyle = {};

	// scene properties
	loop: while (parser.isIdentifier()) {
		switch (parser.peekValue()) {
			case "color":
				result.color = parseColor(parser).color;
				break;
			case "font": {
				result.font = {};
				const font = parseFont(parser);
				if (font.name) result.font.name = font.name;
				if (font.size) result.font.size = font.size;
				break;
			}
			default:
				break loop;
		}
	}

	parser.consume("PUNCT", "}");
	return result;
}

function parseMenuSelection(parser: NeatParser) {
	parser.identifier("selection");
	parser.consume("PUNCT", "{");

	const result: Record<string, unknown> = {};

	// scene properties
	loop: while (parser.isIdentifier()) {
		switch (parser.peekValue()) {
			case "background":
				result.background = parseColor(parser).color;
				break;
			default:
				break loop;
		}
	}

	parser.consume("PUNCT", "}");
	return result;
}
