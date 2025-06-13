import type { NeatParser } from "../../../parser";
import { parseValueTuple } from "../../shared/common.rule";

export function parseImage(parser: NeatParser): unknown {
	parser.consume("IDENTIFIER", "image");

	const source = parser.consume(["STRING", "IDENTIFIER"]).value as string;

	let at: { x: unknown; y: unknown } | null = null;
	let repeat: [unknown, unknown] | null = null;

	while (parser.is("IDENTIFIER")) {
		switch (parser.peekValue()) {
			case "at": {
				parser.advance();
				const tuple = parseValueTuple(parser);
				at = { x: tuple[0], y: tuple[1] };
				break;
			}
			case "repeat": {
				parser.advance();
				repeat = parseValueTuple(parser);
				break;
			}
			default:
				return {
					type: "IMAGE",
					source,
					at,
					repeat,
				};
		}
	}

	if (!at) throw new Error("Missing required 'at' argument in image command.");

	return {
		cmd: "IMAGE",
		source,
		at,
		repeat,
	};
}
