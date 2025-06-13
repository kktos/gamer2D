import type { NeatParser } from "../../parser";
import type { TNeatAlignCommand, TNeatColorCommand, TNeatFontCommand } from "../../types/value-types";

export function parseColor(parser: NeatParser): TNeatColorCommand {
	parser.identifier();
	const color = parser.consume(["COLOR", "IDENTIFIER"]);
	return { cmd: "COLOR", color: color.value as string };
}

export function parseAlign(parser: NeatParser) {
	parser.identifier("align");
	const result: TNeatAlignCommand = { cmd: "ALIGN", align: parser.identifier(["left", "center", "right"]) };
	if (parser.is("PUNCT", ",")) {
		parser.advance();
		result.valign = parser.identifier(["top", "center", "bottom"]);
	}
	return result;
}

export function parseFont(parser: NeatParser) {
	parser.identifier("font");
	const parts: unknown[] = [];
	parts.push(parser.advance().value);
	if (parser.is("PUNCT", ",")) {
		parser.advance();
		parts.push(parser.advance().value);
	}

	const fontSpec: TNeatFontCommand = { cmd: "FONT" };
	for (const part of parts) {
		if (typeof part === "string") fontSpec.name = part;
		else if (typeof part === "number") fontSpec.size = part;
	}

	return fontSpec;
}
