import type { NeatParser } from "../../parser";
import { parseVariableAssignment } from "../shared/assign.rule";
import { parseColor } from "../shared/style.rule";
import { parseImage } from "./ui/image.rule";

export function parseLayerBackground(parser: NeatParser) {
	parser.consume("PUNCT", "{");

	const result: unknown[] = [];

	loop: while (parser.is(["IDENTIFIER", "VARIABLE"])) {
		if (parser.is("VARIABLE")) {
			result.push(parseVariableAssignment(parser));
			continue;
		}
		switch (parser.peekValue()) {
			case "color":
				result.push(parseColor(parser));
				break;
			case "image":
				result.push(parseImage(parser));
				break;
			default:
				break loop;
		}
	}

	parser.consume("PUNCT", "}");
	return result;
}
