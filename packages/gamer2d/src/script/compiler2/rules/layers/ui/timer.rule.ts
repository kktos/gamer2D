import { generateID } from "../../../../../utils/id.util";
import type { NeatParser } from "../../../parser";
import type { TNeatTimerCommand } from "../../../types/commands.type";
import { parseValueExpression } from "../../shared/value-expr.rule";

export function parseTimer(parser: NeatParser) {
	parser.consume("IDENTIFIER", "timer");

	const result: TNeatTimerCommand = { cmd: "TIMER", id: "", isRepeating: false, duration: [{ type: "const", value: 0 }] };

	if (parser.isIdentifier(["every", "after"])) result.id = generateID();
	else result.id = parser.name();

	const tok = parser.identifier(["every", "after"]);
	result.isRepeating = tok === "every";

	result.duration = parseValueExpression(parser);

	parser.identifier("ms");

	return result;
}
