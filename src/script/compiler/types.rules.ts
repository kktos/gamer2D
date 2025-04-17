import { ArgColor, ArgVariable } from "../../types/value.types";
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
			return new ArgVariable($.CONSUME(tokens.Variable).image.substring(1));
		});
	}

	static htmlColor($) {
		return $.RULE("htmlColor", () => {
			const colorName = () => $.CONSUME(tokens.Identifier).image;
			const colorHex = () => $.CONSUME(tokens.HexNumber).image;
			return new ArgColor($.OR([{ ALT: colorHex }, { ALT: colorName }]));
		});
	}

	static numOrVar($) {
		return $.RULE("numOrVar", () => {
			return $.OR([
				{
					ALT: () => {
						$.CONSUME(tokens.True);
						return true;
					},
				},
				{
					ALT: () => {
						$.CONSUME(tokens.False);
						return false;
					},
				},
				{ ALT: () => $.SUBRULE($.number) },
				{ ALT: () => $.SUBRULE($.variable) },
			]);
		});
	}

	static strOrVar($) {
		return $.RULE("strOrVar", () => {
			return $.OR([{ ALT: () => $.CONSUME(tokens.StringLiteral).payload }, { ALT: () => $.SUBRULE($.variable) }]);
		});
	}

	static varOrArrayOfVars($) {
		return $.RULE("varOrArrayOfVars", () => {
			return $.OR([{ ALT: () => $.SUBRULE($.variable) }, { ALT: () => $.SUBRULE($.arrayOfVars) }]);
		});
	}

	static arrayOfVars($) {
		return $.RULE("arrayOfVars", () => {
			const result: unknown[] = [];
			$.CONSUME(tokens.OpenBracket);
			$.MANY_SEP({
				SEP: tokens.Comma,
				DEF: () => result.push($.SUBRULE($.variable)),
			});
			$.CONSUME(tokens.CloseBracket);
			return result;
		});
	}
}
