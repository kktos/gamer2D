import { OP_TYPES } from "../../../../../types/operation.types";
import type { TupleToUnion } from "../../../../../types/typescript.types";
import type { ArgExpression, ArgVariable } from "../../../../../types/value.types";
import { tokens } from "../../../lexer";
import type { TImage } from "./image.rules";
import type { TMenuItemGroup } from "./menu.rules";
import type { TSprite } from "./sprite.rules";
import type { TText } from "./text.rules";

/*
		repeat $idx count:5 {				
			item {
				text "toto" at:300,200
				[...]
			}
		}
 */

export type TRepeatItem = TSprite | TText | TMenuItemGroup | TImage;
export type TRepeat = {
	type: TupleToUnion<[typeof OP_TYPES.REPEAT]>;
	from?: number | ArgVariable | ArgExpression;
	count: number | ArgVariable | ArgExpression;
	items: TRepeatItem[];
	index?: string;
	list?: string | string[] | number[];
	var?: string;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class RepeatRules {
	static layoutRepeat($) {
		return $.RULE("layoutRepeat", (options, isMenuItem: boolean) => {
			// repeat
			$.CONSUME(tokens.Repeat);

			const result: TRepeat = { type: OP_TYPES.REPEAT, count: 0, items: [] };

			// optional var for iterator
			$.OPTION(() => {
				result.index = $.CONSUME(tokens.Variable).image.substring(1);
				$.variablesDict.set(result.index, 0);
			});

			// count:<number>
			result.count = $.SUBRULE($.parm_count);

			// { repeatItems }
			result.items = $.SUBRULE($.layoutRepeatItems, {
				ARGS: [options, isMenuItem],
			});

			return result;
		});
	}

	static layoutRepeatItems($) {
		return $.RULE("layoutRepeatItems", (options, isMenuItem) => {
			const items: TRepeatItem[] = [];

			$.CONSUME(tokens.OpenCurly);
			// list of
			// text | sprite | item | image
			$.AT_LEAST_ONE(() => {
				const item = $.OR([
					{ ALT: () => $.SUBRULE($.layoutText, { ARGS: [options, isMenuItem] }) },
					{ ALT: () => $.SUBRULE($.layoutSprite, { ARGS: [options] }) },
					{ ALT: () => $.SUBRULE($.layoutMenuItemGroup, { ARGS: [options] }) },
					{ ALT: () => $.SUBRULE($.layoutImage, { ARGS: [options] }) },
				]);
				items.push(item);
			});
			$.CONSUME(tokens.CloseCurly);

			return items;
		});
	}
}
