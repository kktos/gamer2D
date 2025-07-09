import { generateID } from "../../../../../utils/id.util";
import type { NeatParser } from "../../../parser";
import type { TNeatTimerCommand } from "../../../types/commands.type";
import { parseValueExpression } from "../../shared/value-expr.rule";

export function parseTimer(parser: NeatParser) {
	parser.consume("IDENTIFIER", "timer");

	const result: Partial<TNeatTimerCommand> = { cmd: "TIMER", id: "", duration: [{ type: "const", value: 0 }] };

	if (parser.isIdentifier(["every", "after", "at"])) result.id = generateID();
	else result.id = parser.name();

	const tok = parser.identifier(["every", "after", "at"]);
	switch (tok) {
		case "every":
			result.kind = "repeat";
			break;
		case "after":
			result.kind = "once";
			break;
		case "at":
			result.kind = "schedule";
			break;
	}

	result.duration = parseValueExpression(parser);

	const unit = parser.identifier(["ms", "s", "cs", "ds", "unit"]);
	switch (unit) {
		case "ms":
			result.timeScale = 1;
			break;
		case "s":
			result.timeScale = 1000;
			break;
		case "cs":
			result.timeScale = 100;
			break;
		case "ds":
			result.timeScale = 10;
			break;
		case "unit": {
			parser.consume("NUMBER", 1);
			parser.punct("/");
			result.timeScale = parser.number();
			parser.identifier("s");
			break;
		}
	}

	return result as TNeatTimerCommand;
}
