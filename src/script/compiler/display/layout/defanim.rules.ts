import { OP_TYPES } from "../../../../types/operation.types";
import type { TupleToUnion } from "../../../../types/typescript.types";
import { tokens } from "../../lexer";
import type { TFunctionCall } from "./action.rules";

export type TAnimDef = {
	type: TupleToUnion<[typeof OP_TYPES.ANIM]>;
	name: string;
	path?: TFunctionCall[];
	speed?: number;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class DefAnimRules {
	static layoutDefAnim($) {
		return $.RULE("layoutDefAnim", (options) => {
			$.CONSUME(tokens.Def);
			$.CONSUME(tokens.Anim);

			const result: TAnimDef = {
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
			return { name: "path", value: $.SUBRULE($.layoutActionBlock, { ARGS: [{ noSystem: true }] }) };
		});
	}
	static layoutDefAnimSpeed($) {
		return $.RULE("layoutDefAnimSpeed", () => {
			$.CONSUME(tokens.Speed);
			return { name: "speed", value: $.SUBRULE($.number) };
		});
	}
}
