import type { NeatParser } from "../../parser";
import type { TNeatAlignCommand, TNeatBgColorCommand, TNeatColorCommand, TNeatFontCommand, TNeatZoomCommand } from "../../types/commands.type";
import { parseValueExpression } from "./value-expr.rule";

export function parseColor(parser: NeatParser): TNeatColorCommand {
	parser.identifier();
	return { cmd: "COLOR", color: parseColorValue(parser) };
}

export function parseBgColor(parser: NeatParser): TNeatBgColorCommand {
	parser.identifier();
	return { cmd: "BGCOLOR", color: parseColorValue(parser) };
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

export function parseZoom(parser: NeatParser) {
	parser.identifier("zoom");
	const result: TNeatZoomCommand = { cmd: "ZOOM", value: parseValueExpression(parser) };
	return result;
}

export function parseFont(parser: NeatParser) {
	parser.identifier("font");
	const parts: unknown[] = [];
	parts.push(parser.consume(["STRING", "NUMBER"]).value);
	if (parser.is("PUNCT", ",")) {
		parser.consume("PUNCT", ",");
		parts.push(parser.consume("NUMBER").value);
	}

	const fontSpec: TNeatFontCommand = { cmd: "FONT" };
	for (const part of parts) {
		if (typeof part === "string") fontSpec.name = part;
		else if (typeof part === "number") fontSpec.size = part;
	}

	return fontSpec;
}

function parseColorValue(parser: NeatParser) {
	if (parser.is("COLOR")) return parser.color();

	const identifier = parser.identifier();
	let color = "";
	if (identifier === "rgba" && parser.is("PUNCT", "(")) {
		parser.consume("PUNCT", "(");
		const r = parser.number();
		if (parser.is("PUNCT")) parser.consume("PUNCT", ",");
		const g = parser.number();
		if (parser.is("PUNCT")) parser.consume("PUNCT", ",");
		const b = parser.number();
		if (parser.is("PUNCT")) parser.consume("PUNCT", ",");
		const a = parser.number();
		color = `rgba(${r}, ${g}, ${b}, ${a})`;
		parser.consume("PUNCT", ")");
	} else {
		color = identifier;
	}
	return color;
}
