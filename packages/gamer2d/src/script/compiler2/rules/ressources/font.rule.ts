import type { NeatParser } from "../../parser";

export type TFontSheet = {
	name: string;
	height: number;
	width: number;
	charset: string;
	image: string;
	offsetX: number;
	offsetY: number;
	gapX: number;
	gapY: number;
	isMulticolor: boolean;
};

export function parseFontsheet(parser: NeatParser) {
	parser.identifier("font");

	const result: Partial<TFontSheet> = { name: parser.name(), offsetX: 0, offsetY: 0, gapX: 0, gapY: 0, isMulticolor: false };

	parser.punct("{");

	loop: while (parser.is("IDENTIFIER")) {
		switch (parser.peek().value) {
			case "image":
				parser.advance();
				result.image = parser.string();
				break;
			case "size":
				parser.advance();
				result.height = parser.number();
				parser.punct(",");
				result.width = parser.number();
				break;
			case "offset":
				parser.advance();
				result.offsetX = parser.number();
				parser.punct(",");
				result.offsetY = parser.number();
				break;
			case "gap":
				parser.advance();
				result.gapX = parser.number();
				parser.punct(",");
				result.gapY = parser.number();
				break;
			case "multicolor":
				parser.advance();
				result.isMulticolor = true;
				break;
			case "charset":
				parser.advance();
				result.charset = parseCharset(parser);
				break;
			default:
				break loop;
		}
	}

	if (!result.charset || !result.image || !result.height || !result.width)
		throw new SyntaxError(`Missing mandatory 'charset' or 'image' or 'size' property for fontsheet ${result.name}`);

	parser.punct("}");

	return result as TFontSheet;
}

function parseCharset(parser: NeatParser) {
	let result = "";

	parser.punct("[");

	while (!parser.is("PUNCT", "]")) {
		result += parser.string();
		if (parser.is("PUNCT", ",")) parser.advance();
	}
	
	parser.punct("]");

	return result;
}
