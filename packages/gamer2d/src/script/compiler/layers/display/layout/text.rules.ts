import type { TextEntity } from "../../../../../entities/text.entity";
import type { BBox } from "../../../../../maths/BBox.class";
import { OP_TYPES } from "../../../../../types/operation.types";
import type { TupleToUnion } from "../../../../../types/typescript.types";
import type { ArgColor, ArgExpression, ArgVariable, ValueTrait } from "../../../../../types/value.types";
import { tokens } from "../../../lexer";
import type { TAlignType } from "./text-sprite-props.rules";

export class TText {
	type: TupleToUnion<[typeof OP_TYPES.TEXT]>;
	text: string;
	id?: string;
	pos: [number | ArgVariable | ArgExpression, number | ArgVariable | ArgExpression];
	size?: number;
	align?: TAlignType;
	valign?: TAlignType;
	color?: ArgColor;
	anim?: { name: string };
	action?: unknown[];
	width?: number | ArgVariable;
	height?: number | ArgVariable;
	bgcolor?: ArgColor;
	traits?: (ArgVariable | ValueTrait)[] | ArgVariable;

	bbox!: () => BBox;
	entity?: TextEntity;

	constructor(text: string) {
		this.type = OP_TYPES.TEXT;
		this.text = text;
		this.pos = [0, 0];
	}
	[Symbol.for("inspect")]() {
		return `TEXT "${this.text}" at:${this.pos[0]},${this.pos[1]}`;
	}
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class TextRules {
	static layoutText($) {
		return $.RULE("layoutText", (options, isMenuItem: boolean) => {
			$.CONSUME(tokens.Text);

			const result = new TText($.SUBRULE($.strOrVar));

			if (options?.size) result.size = options.size;
			if (options?.align) result.align = options.align;
			if (options?.valign) result.valign = options.valign;
			if (options?.color) result.color = options.color;
			if (options?.anim) result.anim = options.anim;
			if (options?.bgcolor) result.bgcolor = options.bgcolor;

			$.MANY(() => {
				$.OR([
					{
						ALT: () => {
							$.CONSUME(tokens.ID);
							$.CONSUME2(tokens.Colon);
							result.id = $.CONSUME3(tokens.StringLiteral).payload;
						},
					},
					{
						ALT: () => {
							result.pos = $.SUBRULE($.parm_at);
						},
					},
					{
						ALT: () => {
							result.width = $.SUBRULE($.parm_width);
						},
					},
					{
						ALT: () => {
							result.height = $.SUBRULE($.parm_height);
						},
					},
					{
						ALT: () => {
							result.traits = $.SUBRULE($.parm_traits);
						},
					},
					{
						ALT: () => {
							const { name, value, isParm } = $.SUBRULE($.textSpriteProps);
							$.ACTION(() => {
								if (!isParm) options[name] = value;
								else result[name] = value;
							});
						},
					},
				]);
			});

			// action: { <statements> } OPTIONAL as user can manage is with events
			$.OPTION({
				GATE: () => isMenuItem,
				DEF: () => {
					result.action = $.SUBRULE3($.layoutAction);
				},
			});

			return result;
		});
	}
}
