import { ArgColor, ArgVariable } from "../../../types/value.types";
import { tokens } from "../lexer";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class TypesRules {
	static number($) {
		return $.RULE("number", () => {
			const isNegative = $.OPTION(() => $.CONSUME(tokens.Minus));
			const numberStr = $.CONSUME(tokens.Integer).image;
			return Number.parseInt(numberStr) * (isNegative ? -1 : 1);
		});
	}

	// static variable($) {
	// 	return $.RULE("variable", () => {
	// 		return new ArgVariable($.CONSUME(tokens.Variable).image.substring(1));
	// 	});
	// }

	static definedVariable($) {
		return $.RULE("definedVariable", () => {
			const varName = $.CONSUME(tokens.Variable).image.substring(1);
			$.ACTION(() => {
				const parts = varName.split(".");
				if (!$.variablesDict.has(parts[0])) throw new TypeError(`Unknown variable "${parts[0]}"`);
			});
			return new ArgVariable(varName);
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
				{ ALT: () => $.SUBRULE($.definedVariable) },
			]);
		});
	}

	static tupleNumOrVar($) {
		return $.RULE("tupleNumOrVar", () => {
			const x = $.SUBRULE($.expr);
			$.CONSUME(tokens.Comma);
			const y = $.SUBRULE2($.expr);
			return [x, y];
		});
	}

	static strOrVar($) {
		return $.RULE("strOrVar", () => {
			return $.OR([{ ALT: () => $.CONSUME(tokens.StringLiteral).payload }, { ALT: () => $.SUBRULE($.definedVariable) }]);
		});
	}

	static varOrArrayOfVars($) {
		return $.RULE("varOrArrayOfVars", () => {
			return $.OR([{ ALT: () => $.SUBRULE($.definedVariable) }, { ALT: () => $.SUBRULE($.arrayOfVars) }]);
		});
	}

	static arrayOfVars($) {
		return $.RULE("arrayOfVars", () => {
			const result: unknown[] = [];
			$.CONSUME(tokens.OpenBracket);
			$.MANY_SEP({
				SEP: tokens.Comma,
				DEF: () => result.push($.SUBRULE($.definedVariable)),
			});
			$.CONSUME(tokens.CloseBracket);
			return result;
		});
	}

	static arrayOfVarsAndStrings($) {
		return $.RULE("arrayOfVarsAndStrings", () => {
			const result: unknown[] = [];
			$.CONSUME(tokens.OpenBracket);
			$.MANY_SEP({
				SEP: tokens.Comma,
				DEF: () => result.push($.SUBRULE($.strOrVar)),
			});
			$.CONSUME(tokens.CloseBracket);
			return result;
		});
	}
}
