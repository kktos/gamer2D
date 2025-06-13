import { NeatLexerError } from "../../lexerError";
import type { NeatParser } from "../../parser";

type SettingValue = boolean | string | number | (string | number)[];
interface SettingsData {
	[key: string]: SettingValue;
}

export function parseSettings(parser: NeatParser): { type: string; data: SettingsData } {
	parser.identifier("settings");
	parser.consume("PUNCT", "{");

	const settings: SettingsData = {};

	while (parser.is("IDENTIFIER")) {
		const name = parser.identifier();
		parser.consume("PUNCT", "=");
		const value = parseSettingValue(parser);
		settings[name] = value;
	}

	parser.consume("PUNCT", "}");
	return { type: "settings", data: settings };
}

// Helper for parsing a single setting value
function parseSettingValue(parser: NeatParser) {
	const peekedToken = parser.peek();
	switch (peekedToken.type) {
		case "PUNCT":
			if (peekedToken.value === "[") {
				parser.consume("PUNCT", "[");
				const arr: (string | number)[] = [];

				// Handle empty array or first element
				if (!parser.is("PUNCT", "]")) {
					arr.push(parseArrayElementValue(parser));

					// Parse subsequent elements (comma-separated)
					while (parser.is("PUNCT", ",")) {
						parser.consume("PUNCT", ",");
						// Ensure there's an element after the comma and not an immediate ']'
						if (parser.is("PUNCT", "]")) {
							NeatLexerError.throwInvalidToken(
								parser.lexer.lines,
								parser.peek(), // The ']' token
								"an array element after comma",
								`but found ']' at line ${parser.peek().pos[0]}, col ${parser.peek().pos[1]}`,
							);
						}
						arr.push(parseArrayElementValue(parser));
					}
				}
				parser.consume("PUNCT", "]");
				return arr;
			}
			// If PUNCT is not '[', fall through to the default error case
			break;
		case "STRING":
			return parser.string();
		case "NUMBER":
			return parser.number();
		case "IDENTIFIER":
			return parser.isBoolean() ? parser.boolean() : parser.identifier();
		case "COLOR":
			return parser.consume("COLOR").value as string;
	}
	throw new Error("a setting value (e.g., string, number, identifier, color, or array starting with '[')");
}

// Helper for parsing elements within an array: strings, numbers, or identifiers (as strings)
function parseArrayElementValue(parser: NeatParser): string | number {
	const token = parser.peek();
	switch (token.type) {
		case "STRING":
			return parser.string();
		case "NUMBER":
			return parser.number();
		case "IDENTIFIER":
			return parser.identifier();
	}

	throw new Error("a STRING, NUMBER, or IDENTIFIER for an array element");
}
