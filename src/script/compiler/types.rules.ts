import { tokens } from "./lexer";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class TypesRules {
	static number($) {
		return $.RULE("number", () => {
			const isNegative = $.OPTION(() => $.CONSUME(tokens.Minus));
			const numberStr = $.CONSUME(tokens.Integer).image;
			return Number.parseInt(numberStr) * (isNegative ? -1 : 1);
		});
	}

	static variable($) {
		return $.RULE("variable", () => {
			// return $.CONSUME(tokens.Variable).image.substring(1);
			return $.CONSUME(tokens.Variable).image;
		});
	}

	static htmlColor($) {
		return $.RULE("htmlColor", () => {
			const colorName = () => $.CONSUME(tokens.Identifier).image;
			const colorHex = () => $.CONSUME(tokens.HexNumber).image;
			return $.OR([{ ALT: colorHex }, { ALT: colorName }]);
		});
	}

	static numOrVar($) {
		return $.RULE("numOrVar", () => {
			return $.OR([{ ALT: () => $.SUBRULE($.number) }, { ALT: () => $.SUBRULE($.variable) }]);
		});
	}

	static strOrVar($) {
		return $.RULE("strOrVar", () => {
			return $.OR([{ ALT: () => $.CONSUME(tokens.StringLiteral).payload }, { ALT: () => $.SUBRULE($.variable) }]);
		});
	}
}
