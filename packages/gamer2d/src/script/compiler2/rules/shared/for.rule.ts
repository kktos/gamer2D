import type { NeatParser } from "../../parser";
import { parseSprite } from "../layers/ui/sprite.rule";
import { parseText } from "../layers/ui/text.rule";
import { parseValueTuple } from "./common.rule";
import { parseItemGroup } from "./item-group.rule";
import { parseValueExpression } from "./value-expr.rule";

type TNeatFor = { cmd: "FOR"; var?: string; list?: unknown; index?: string; body: unknown[] };

export function parseFor(parser: NeatParser) {
	const result: TNeatFor = { cmd: "FOR", body: [] };

	// for $x of $list [index $i] { item { ... } }
	parser.identifier("for");
	const varName = parser.variable();

	if (parser.isIdentifier("of")) {
		parser.advance();

		result.var = varName;
		result.list = parseValueExpression(parser);

		if (parser.isIdentifier("as")) {
			parser.advance();
			result.index = parser.variable();
		}
	} else {
		// for $index from,to { item { ... } }
		result.list = parseValueTuple(parser);
		result.index = varName;
	}

	parser.consume("PUNCT", "{");
	while (parser.is("IDENTIFIER")) {
		switch (parser.peekValue()) {
			case "item":
				result.body.push(parseItemGroup(parser));
				break;
			case "text":
				result.body.push(parseText(parser));
				break;
			case "sprite":
				result.body.push(parseSprite(parser));
				break;
			default:
		}
	}
	parser.consume("PUNCT", "}");

	return result;
}
