import type { NeatParser } from "../../../parser";
import type { TNeatSoundCommand } from "../../../types/commands.type";

export function parseSound(parser: NeatParser) {
	parser.consume("IDENTIFIER", "sound");

	const result: TNeatSoundCommand = { cmd: "SOUND", isPaused: true, name: parser.name() };

	if (parser.isIdentifier("paused")) {
		parser.advance();
	} else if (parser.isIdentifier("play")) {
		parser.advance();
		result.isPaused = false;
	}

	return result;
}
