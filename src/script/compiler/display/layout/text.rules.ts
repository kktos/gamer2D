import type { BBox } from "../../../../maths/math";
import { OP_TYPES } from "../../../../types/operation.types";
import type { TupleToUnion } from "../../../../types/typescript.types";
import type { ArgColor, ArgVariable } from "../../../../types/value.types";
import { tokens } from "../../lexer";

export type TText = {
	type: TupleToUnion<[typeof OP_TYPES.TEXT]>;
	text: string;
	// pos: [number|string, number|string];
	pos: [number | ArgVariable, number | ArgVariable];
	size?: number;
	align?: number;
	valign?: number;
	color?: ArgColor;
	anim?: { name: string };
	action?: unknown[];
	width?: number | ArgVariable;
	height?: number | ArgVariable;
	bgcolor?: ArgColor;
	traits?: ArgVariable[] | ArgVariable;

	bbox?: BBox;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class TextRules {
	static layoutText($) {
		return $.RULE("layoutText", (options, isMenuItem: boolean) => {
			$.CONSUME(tokens.Text);

			const result: TText = {
				type: OP_TYPES.TEXT,
				text: $.SUBRULE($.strOrVar),
				pos: $.SUBRULE2($.parm_at),
			};

			if (options?.size) {
				result.size = options.size;
			}
			if (options?.align) {
				result.align = options.align;
			}
			if (options?.valign) {
				result.valign = options.valign;
			}
			if (options?.color) {
				result.color = options.color;
			}
			if (options?.anim) {
				result.anim = options.anim;
			}
			if (options?.bgcolor) {
				result.bgcolor = options.bgcolor;
			}

			$.OPTION(() => {
				result.width = $.SUBRULE($.layoutViewWidth);
				result.height = $.SUBRULE($.layoutViewHeight);
			});

			$.OPTION2(() => {
				const { name, value, isParm } = $.SUBRULE($.textSpriteProps);

				$.ACTION(() => {
					if (!isParm) options[name] = value;
					else result[name] = value;
				});
			});

			if (isMenuItem) {
				result.action = $.SUBRULE3($.layoutAction);
			}

			return result;
		});
	}
}
