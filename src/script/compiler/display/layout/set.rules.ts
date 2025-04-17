import type { TExpr } from "../../../../types/engine.types";
import { OP_TYPES } from "../../../../types/operation.types";
import type { TupleToUnion } from "../../../../types/typescript.types";
import { ArgColor, ArgIdentifier, ArgVariable, ValueTrait } from "../../../../types/value.types";
import { tokens } from "../../lexer";

export type TSet = {
	type: TupleToUnion<[typeof OP_TYPES.SET]>;
	name: string;
	value: number | string | TExpr[] | ValueTrait | { expr: string };
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class SetRules {
	static layoutSet($) {
		return $.RULE("layoutSet", () => {
			// $.CONSUME(tokens.Set);

			const result: TSet = {
				type: OP_TYPES.SET,
				name: $.CONSUME(tokens.Variable).image.substring(1),
				value: 0,
			};

			$.CONSUME(tokens.Equal);

			result.value = $.SUBRULE($.layoutSetValue);

			$.variablesDict.set(result.name, result.value);

			return result;
		});
	}

	static layoutSetValue($) {
		return $.RULE("layoutSetValue", () => {
			return $.OR([
				{ ALT: () => $.CONSUME(tokens.StringLiteral).payload },
				{ ALT: () => $.SUBRULE($.numOrVar) },
				{ ALT: () => $.SUBRULE($.layoutSetValueArray) },
				{ ALT: () => $.SUBRULE($.layoutSetEval) },
				{ ALT: () => $.SUBRULE($.layoutSetTrait) },
			]);
		});
	}

	static layoutSetTrait($) {
		return $.RULE("layoutSetTrait", () => {
			$.CONSUME(tokens.Trait);
			const name = $.CONSUME(tokens.Identifier).image;

			$.CONSUME(tokens.OpenParent);
			const args = [];
			$.MANY_SEP({
				SEP: tokens.Comma,
				DEF: () => {
					$.OR([
						{ ALT: () => args.push($.SUBRULE($.number)) },
						{ ALT: () => args.push(new ArgIdentifier($.CONSUME2(tokens.Identifier).image)) },
						{ ALT: () => args.push(new ArgIdentifier($.CONSUME2(tokens.Left).image)) },
						{ ALT: () => args.push(new ArgIdentifier($.CONSUME2(tokens.Right).image)) },
						{ ALT: () => args.push(new ArgVariable($.CONSUME2(tokens.Variable).image.substring(1))) },
						{ ALT: () => args.push($.CONSUME2(tokens.StringLiteral).payload) },
						{ ALT: () => args.push(new ArgColor($.CONSUME2(tokens.HexNumber).image)) },
					]);
				},
			});

			// $.ACTION(() => {
			// 	if (args.length < 1 || typeof args[0] !== "string") throw new TypeError("Needs a name for trait");
			// 	name = args.shift() as string;
			// });

			$.CONSUME(tokens.CloseParent);
			return new ValueTrait(name, args);
		});
	}

	static layoutSetEval($) {
		return $.RULE("layoutSetEval", () => {
			$.CONSUME(tokens.Eval);
			const expr = $.CONSUME(tokens.StringLiteral).payload;
			return { expr };
		});
	}

	static layoutSetValueArray($) {
		return $.RULE("layoutSetValueArray", () => {
			$.CONSUME(tokens.OpenBracket);

			const result: unknown[] = [];

			$.MANY_SEP({
				SEP: tokens.Comma,
				DEF: () => {
					$.OR([
						{ ALT: () => result.push($.SUBRULE($.number)) },
						{ ALT: () => result.push($.CONSUME(tokens.StringLiteral).payload) },
						{ ALT: () => result.push(new ArgColor($.CONSUME(tokens.HexNumber).image)) },
						{ ALT: () => result.push(new ArgVariable($.CONSUME2(tokens.Variable).image.substring(1))) },
					]);
				},
			});

			$.CONSUME(tokens.CloseBracket);

			return result;
		});
	}
}
