import type { NeatParser } from "../../../parser";
import type { TNeatButtonCommand, TNeatButtonInstantiationWithBodyCommand, TNeatButtonInstantiationWithoutBodyCommand } from "../../../types/commands.type";
import { parseAt, parseValueTuple } from "../../shared/common.rule";
import { parseSprite } from "../../shared/sprite.rule";
import { parseValueExpression } from "../../shared/value-expr.rule";
import { parseRect } from "./rect.rule";
import { parseText } from "./text.rule";

export function parseButton(parser: NeatParser) {
	parser.consume("IDENTIFIER", "button");

	const result: Partial<TNeatButtonCommand> = { cmd: "BUTTON" };

	if (parser.isString() || (parser.isIdentifier() && !parser.isIdentifier(["size", "at", "pad", "trigger", "content"]))) {
		result.id = parser.name();
	}

	loop: while (parser.is("IDENTIFIER")) {
		switch (parser.peekValue()) {
			case "size": {
				parser.advance();
				const tuple = parseValueTuple(parser);
				(result as TNeatButtonInstantiationWithBodyCommand).size = { width: tuple[0], height: tuple[1] };
				break;
			}
			case "at": {
				(result as TNeatButtonInstantiationWithBodyCommand).at = parseAt(parser);
				break;
			}

			case "pad": {
				parser.advance();
				(result as TNeatButtonInstantiationWithBodyCommand).pad = parseValueTuple(parser);
				break;
			}

			case "trigger":
				parser.advance();
				(result as TNeatButtonInstantiationWithBodyCommand).trigger = parser.name();
				break;

			case "content":
				parser.advance();
				(result as TNeatButtonInstantiationWithoutBodyCommand).content = parseValueExpression(parser);
				break;
			default:
				break loop;
		}
	}

	if (parser.isPunct("{")) {
		result.body = [];
		parser.punct("{");
		while (parser.is(["IDENTIFIER"])) {
			const token = parser.peek();
			switch (token.value) {
				case "rect":
					result.body.push(parseRect(parser));
					break;
				case "text":
					result.body.push(parseText(parser));
					break;
				case "sprite":
					result.body.push(parseSprite(parser));
					break;
				default:
					throw new Error("Unexpected token in button block");
			}
		}
		parser.punct("}");
	}

	if (!(result as TNeatButtonInstantiationWithBodyCommand).at) {
		if (!(result.body && result.id)) throw new Error("Missing required 'id' or block {} argument in button declaration.");
	} else {
		if (!result.body && !result.id) throw new Error("Missing required 'id' argument in button command.");
	}

	return result as TNeatButtonCommand;
}
