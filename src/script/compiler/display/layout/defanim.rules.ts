import type { TupleToUnion } from "../../../../types/typescript.types";
import { OP_TYPES } from "../../../types/operation.types";
import { tokens } from "../../lexer";

export type TAnim = {
	type: TupleToUnion<[typeof OP_TYPES.ANIM]>;
	name: string;
	path?: unknown[];
	speed?: number;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class DefAnimRules {
	static layoutDefAnim($) {
		return $.RULE("layoutDefAnim", (options) => {
			$.CONSUME(tokens.Def);
			$.CONSUME(tokens.Anim);

			const result: TAnim = {
				type: OP_TYPES.ANIM,
				name: $.CONSUME(tokens.StringLiteral).payload,
			};

			$.CONSUME(tokens.OpenCurly);

			$.AT_LEAST_ONE(() => {
				const { name, value } = $.OR([{ ALT: () => $.SUBRULE($.layoutDefAnimPath) }, { ALT: () => $.SUBRULE($.layoutDefAnimSpeed) }]);
				result[name] = value;
			});

			$.CONSUME(tokens.CloseCurly);

			return result;
		});
	}

	static layoutDefAnimPath($) {
		return $.RULE("layoutDefAnimPath", () => {
			$.CONSUME(tokens.Path);
			return { name: "path", value: $.SUBRULE($.layoutActionBlock) };
		});
	}
	static layoutDefAnimSpeed($) {
		return $.RULE("layoutDefAnimSpeed", () => {
			$.CONSUME(tokens.Speed);
			return { name: "speed", value: $.SUBRULE($.number) };
		});
	}
}
