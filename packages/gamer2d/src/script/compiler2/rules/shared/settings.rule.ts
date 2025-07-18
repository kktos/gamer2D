import { loadJson } from "../../../../utils/loaders.util";
import type { NeatParser } from "../../parser";
import type { TNeatSettingsCommand } from "../../types/commands.type";

export function parseSettings(parser: NeatParser) {
	parser.identifier("settings");

	const settings: TNeatSettingsCommand = { cmd: "SETTINGS", value: {} };

	parser.punct("{");

	while (parser.isIdentifier() || parser.isPunct("@")) {
		if (parser.isPunct("@")) {
			parseInclude(parser, settings.value);
			continue;
		}

		const name = parser.rawIdentifier();
		parser.punct("=");
		const value = parseSettingValue(parser);
		settings.value[name] = value;
	}

	parser.punct("}");

	return settings;
}

function parseInclude(parser: NeatParser, settings: Record<string, unknown>) {
	parser.advance();
	parser.identifier("include");
	const path = parser.string();
	loadJson(path)
		.then((json) => {
			for (const key in json) {
				settings[key] = json[key];
			}
		})
		.catch((err) => console.error(`Unable to include settings file: ${path}\n${err}`));
}

// Helper for parsing a single setting value
function parseSettingValue(parser: NeatParser) {
	if (parser.isPunct("[")) return parseArrayValue(parser);
	if (parser.isPunct("{")) return parseObjectValue(parser);
	return parseScalarValue(parser);
}

// Helper for parsing an array value
function parseArrayValue(parser: NeatParser) {
	parser.punct("[");
	const arr: (string | number | boolean)[] = [];

	if (parser.is("PUNCT", "]")) {
		parser.advance();
		return arr;
	}

	do {
		arr.push(parseScalarValue(parser));
	} while (parser.is("PUNCT", ",") && parser.advance());

	parser.punct("]");
	return arr;
}

// Helper for parsing an object value
function parseObjectValue(parser: NeatParser) {
	const object: Record<string, unknown> = {};
	parser.punct("{");

	if (parser.is("PUNCT", "}")) {
		parser.advance();
		return object;
	}

	while (parser.is("IDENTIFIER")) {
		const name = parser.rawIdentifier();
		parser.punct(":");
		const value = parseSettingValue(parser);
		object[name] = value;
	}

	parser.punct("}");
	return object;
}

// Helper for parsing elements within an array: strings, numbers, or identifiers (as strings)
function parseScalarValue(parser: NeatParser): string | number | boolean {
	const token = parser.peek();
	switch (token.type) {
		case "STRING":
			return parser.string();
		case "NUMBER":
			return parser.number();
		case "IDENTIFIER":
			return parser.isBoolean() ? parser.boolean() : parser.rawIdentifier();
		case "COLOR":
			return parser.consume("COLOR").value as string;
	}

	throw new Error("a STRING, NUMBER, or IDENTIFIER for an array element");
}
