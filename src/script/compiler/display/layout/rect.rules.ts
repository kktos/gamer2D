import type { TupleToUnion } from "../../../../types/typescript.types";
import { OP_TYPES } from "../../../types/operation.types";
import { tokens } from "../../lexer";

export type TRect = {
	type: TupleToUnion<[typeof OP_TYPES.RECT]>;
	color: string;
	pos: [number, number];
	width: string;
	height: string;
	action?: unknown[];
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class RectRules {
	static layoutRect($) {
		return $.RULE("layoutRect", (options, isMenuItem) => {
			$.CONSUME(tokens.Rect);

			const result: TRect = {
				type: OP_TYPES.RECT,
				color: options?.color ?? "white",
				pos: $.SUBRULE($.parm_at),
				width: $.SUBRULE($.layoutViewWidth),
				height: $.SUBRULE($.layoutViewHeight),
				action: undefined,
			};

			if (isMenuItem) $.SUBRULE($.layoutAction);

			return result;
		});
	}
}
