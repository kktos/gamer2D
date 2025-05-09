import { OP_TYPES } from "../../../../../types/operation.types";
import type { TupleToUnion } from "../../../../../types/typescript.types";
import { ArgColor, type ArgVariable } from "../../../../../types/value.types";
import { tokens } from "../../../lexer";

export type TRect = {
	type: TupleToUnion<[typeof OP_TYPES.RECT]>;
	color?: ArgColor;
	pos: [number | ArgVariable, number | ArgVariable];
	width: number | ArgVariable;
	height: number | ArgVariable;
	// action?: unknown[];
	fill?: ArgColor;
	pad?: [number | ArgVariable, number | ArgVariable];
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class RectRules {
	static layoutRect($) {
		return $.RULE("layoutRect", (options, isMenuItem) => {
			$.CONSUME(tokens.Rect);

			const result: TRect = {
				type: OP_TYPES.RECT,
				pos: $.SUBRULE($.parm_at),
				width: $.SUBRULE($.parm_width),
				height: $.SUBRULE($.parm_height),
				// action: undefined,
			};

			$.OPTION(() => {
				$.CONSUME(tokens.Fill);
				$.CONSUME(tokens.Colon);
				result.fill = $.SUBRULE($.htmlColor);
			});

			$.OPTION2(() => {
				$.CONSUME(tokens.Pad);
				$.CONSUME2(tokens.Colon);
				result.pad = $.SUBRULE($.tupleExpr);
			});

			$.ACTION(() => {
				if (!result.fill) result.color = options?.color ?? new ArgColor("white");
			});
			// if (isMenuItem) $.SUBRULE($.layoutAction);

			return result;
		});
	}
}
