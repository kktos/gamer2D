import type { TupleToUnion } from "../../../../../types/typescript.types";
import { ArgVariable, ValueTrait } from "../../../../../types/value.types";
import { tokens } from "../../../lexer";

const NUMBER = 1;
const ALIGN = 2;
const VALIGN = 3;
const COLOR = 4;
const ANIM = 5;
const TRAITS = 6;

export const ALIGN_TYPES = {
	LEFT: 1,
	RIGHT: 2,
	TOP: 3,
	BOTTOM: 4,
	CENTER: 5,
} as const;

export type TAlignType = TupleToUnion<[(typeof ALIGN_TYPES)[keyof typeof ALIGN_TYPES]]>;

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
				{
					ALT: () => {
						propType = TRAITS;
						return $.CONSUME(tokens.Traits);
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
				{
					ALT: () => {
						valueType = TRAITS;
						value = $.SUBRULE($.varOrArrayOfVars);
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
					case TRAITS:
						if (valueType !== TRAITS) throw new TypeError(`Invalid value ${value} for ${name}`);
						if (!isParm) throw new TypeError(`${name} can only be used as a param`);
						if (Array.isArray(value)) {
							throwIfVarsAreNotTraits($, value);
						} else {
							const varName = (value as ArgVariable).value;
							if (!$.variablesDict.has(varName)) throw new TypeError(`Unknown variable "${varName}"`);
							const varValue = $.variablesDict.get(varName);
							if (!Array.isArray(varValue)) throw new TypeError(`Variable "${varName}" is not an array of traits`);
							throwIfVarsAreNotTraits($, varValue);
						}
						break;
				}
			});

			return { name, value, isParm };
		});
	}
}

function throwIfVarsAreNotTraits($, vars: ArgVariable[]) {
	for (const value of vars) {
		if (!(value instanceof ArgVariable)) throw new TypeError(`This "${value}" is not a variable`);
		const varName = (value as ArgVariable).value;
		if (!$.variablesDict.has(varName)) throw new TypeError(`Unknown variable "${varName}"`);
		const varValue = $.variablesDict.get(varName);
		if (!(typeof varValue === "object" && varValue instanceof ValueTrait)) throw new TypeError(`Variable "${varName}" is not a trait`);
	}
}
