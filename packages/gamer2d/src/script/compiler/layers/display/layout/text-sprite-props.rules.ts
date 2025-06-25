import type { ArgVariable } from "../../../../../types/value.types";
import { ALIGN_TYPES } from "../../../../compiler2/types/align.type";
import { tokens } from "../../../lexer";

const NUMBER = 1;
const ALIGN = 2;
const VALIGN = 3;
const COLOR = 4;
const ANIM = 5;
const _TRAITS = 6;

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class TextSpritePropsRules {
	static textSpriteProps($) {
		return $.RULE("textSpriteProps", () => {
			let propType = 0;
			const name = $.OR([
				{
					ALT: () => {
						propType = ALIGN;
						return $.CONSUME(tokens.Align);
					},
				},
				{
					ALT: () => {
						propType = VALIGN;
						return $.CONSUME(tokens.VAlign);
					},
				},
				{
					ALT: () => {
						propType = NUMBER;
						return $.CONSUME(tokens.Size);
					},
				},
				{
					ALT: () => {
						propType = NUMBER;
						return $.CONSUME(tokens.Zoom);
					},
				},
				{
					ALT: () => {
						propType = COLOR;
						return $.CONSUME(tokens.Color);
					},
				},
				{
					ALT: () => {
						propType = ANIM;
						return $.CONSUME(tokens.Anim);
					},
				},
				{
					ALT: () => {
						propType = COLOR;
						$.CONSUME(tokens.Background);
						return { image: "bgcolor" };
					},
				},
			]).image;

			let isParm = false;
			$.OPTION(() => {
				$.CONSUME(tokens.Colon);
				isParm = true;
			});

			let valueType = 0;
			let value: string | number | { name: string } | ArgVariable[] | ArgVariable = 0;
			$.OR2([
				{
					ALT: () => {
						valueType = NUMBER;
						value = $.SUBRULE($.number);
					},
				},
				{
					ALT: () => {
						valueType = COLOR;
						value = $.SUBRULE($.htmlColor);
					},
				},
				{
					ALT: () => {
						valueType = ALIGN;
						$.CONSUME(tokens.Left);
						value = ALIGN_TYPES.LEFT;
					},
				},
				{
					ALT: () => {
						valueType = ALIGN;
						$.CONSUME(tokens.Right);
						value = ALIGN_TYPES.RIGHT;
					},
				},
				{
					ALT: () => {
						valueType = ALIGN;
						$.CONSUME(tokens.Top);
						value = ALIGN_TYPES.TOP;
					},
				},
				{
					ALT: () => {
						valueType = ALIGN;
						$.CONSUME(tokens.Bottom);
						value = ALIGN_TYPES.BOTTOM;
					},
				},
				{
					ALT: () => {
						valueType = ALIGN;
						$.CONSUME(tokens.Center);
						value = ALIGN_TYPES.CENTER;
					},
				},
				{
					ALT: () => {
						valueType = ANIM;
						value = {
							name: $.CONSUME(tokens.StringLiteral).payload,
						};
					},
				},
			]);

			$.ACTION(() => {
				switch (propType) {
					case ALIGN:
						if (valueType !== NUMBER && valueType !== ALIGN) throw new TypeError(`Invalid value ${value} for ${name}`);
						break;
					case COLOR:
						if (valueType !== COLOR) throw new TypeError(`Invalid value ${value} for ${name}`);
						break;
					case NUMBER:
						if (valueType !== NUMBER) throw new TypeError(`Invalid value ${value} for ${name}`);
						break;
					case ANIM:
						if (valueType !== ANIM) throw new TypeError(`Invalid value ${value} for ${name}`);
						break;
				}
			});

			return { name, value, isParm };
		});
	}
}
