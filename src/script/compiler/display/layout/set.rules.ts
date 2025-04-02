import type { TupleToUnion } from "../../../../types/typescript.types";
import { OP_TYPES } from "../../../types/operation.types";
import { tokens } from "../../lexer";

export type TSet = {
	type: TupleToUnion<[typeof OP_TYPES.SET]>;
	name: string;
	value: number | string;
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
			]);
		});
	}

	static layoutSetEval($) {
		return $.RULE("layoutSetEval", () => {
			$.CONSUME(tokens.Eval);
			$.CONSUME(tokens.OpenParent);
			const expr = $.CONSUME(tokens.StringLiteral).payload;
			$.CONSUME(tokens.CloseParent);
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
					result.push($.CONSUME(tokens.StringLiteral).payload);
				},
			});

			$.CONSUME(tokens.CloseBracket);

			return result;
		});
	}
}
