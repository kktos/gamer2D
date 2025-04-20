import { OP_TYPES } from "../../../../types/operation.types";
import type { TupleToUnion } from "../../../../types/typescript.types";
import type { ArgVariable } from "../../../../types/value.types";
import { tokens } from "../../lexer";

export type TMath = {
	type: TupleToUnion<[typeof OP_TYPES.MATH]>;
	fn: "add";
	params: (string | number | ArgVariable)[];
};
// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class MathRules {
	static mathAdd($) {
		return $.RULE("mathAdd", (options) => {
			$.CONSUME(tokens.Add);

			const result = {
				type: OP_TYPES.MATH,
				fn: "add",
				params: [],
			};

			const varName = $.CONSUME(tokens.Variable).image.substring(1);
			if (!$.variablesDict.has(varName)) throw new TypeError(`Unknown variable "${varName}"`);

			result.params.push(varName);

			$.CONSUME(tokens.Comma);
			result.params.push($.SUBRULE($.numOrVar));

			return result;
		});
	}
}
