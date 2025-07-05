import type { NeatParser } from "../../parser";
import type { TNeatCommand } from "../../types/commands.type";
import { parseVariableAssignment } from "../shared/assign.rule";
import { parseFor } from "../shared/for.rule";
import { parseOn } from "../shared/on.rule";
import { parseSettings } from "../shared/settings.rule";
import { parseSprite } from "../shared/sprite.rule";
import { parsePool } from "./ui/pool.rule";
import { parseTimer } from "./ui/timer.rule";

const COMMAND_HANDLERS = {
	on: parseOn,
	sprite: parseSprite,
	pool: parsePool,
	for: parseFor,
	timer: parseTimer,
	settings: parseSettings,
} as const;

export function parseLayerEntites(parser: NeatParser) {
	parser.punct("{");

	const result: TNeatCommand[] = [];

	while (parser.is(["IDENTIFIER", "VARIABLE"])) {
		if (parser.is("VARIABLE")) {
			result.push(parseVariableAssignment(parser));
			continue;
		}

		const commandName = parser.peekValue();
		const handler = COMMAND_HANDLERS[commandName as keyof typeof COMMAND_HANDLERS];
		if (!handler) break;
		result.push(handler(parser));
	}

	parser.punct("}");
	return result;
}
