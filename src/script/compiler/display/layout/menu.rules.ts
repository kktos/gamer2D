import type { BBox } from "../../../../maths/math";
import type { TupleToUnion } from "../../../../types/typescript.types";
import { OP_TYPES } from "../../../types/operation.types";
import { tokens } from "../../lexer";
import type { TRepeat } from "./repeat.rules";
import type { TSprite } from "./sprite.rules";
import type { TText } from "./text.rules";

/*
	menu {
		selection {
			color yellow
			background #faee005e
		}
		items {
			repeat count:$menuItems.length var:idx step:{ at:0,50 } {				
				item {
					text $menuItems.$idx at:300,200
				}
			}		
		}
	}
*/

export type TMenuSelection = {
	color?: string;
	background?: string;
	left?: string;
	right?: string;
	var?: string;
};
export type TMenuItemGroup = {
	type: TupleToUnion<[typeof OP_TYPES.GROUP]>;
	items: (TSprite | TText)[];
	action?: unknown[];

	bbox?: BBox;
};
export type TMenuItem = TRepeat | TMenuItemGroup | TText | TSprite;
export type TMenu = {
	type: TupleToUnion<[typeof OP_TYPES.MENU]>;
	items: TMenuItem[];
	selection?: TMenuSelection;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class MenuRules {
	static layoutMenu($) {
		return $.RULE("layoutMenu", (options) => {
			const result: TMenu = { type: OP_TYPES.MENU, items: [] };

			$.CONSUME(tokens.Menu);

			$.CONSUME(tokens.OpenCurly);

			result.selection = $.OPTION(() => $.SUBRULE($.layoutMenuSelection));

			result.items = $.SUBRULE($.layoutMenuItems, { ARGS: [options] });

			$.CONSUME(tokens.CloseCurly);

			return result;
		});
	}
	static layoutMenuItems($) {
		return $.RULE("layoutMenuItems", (options) => {
			$.CONSUME(tokens.Items);
			$.CONSUME(tokens.OpenCurly);

			const items: unknown[] = [];
			$.AT_LEAST_ONE(() => {
				$.OR([
					{ ALT: () => items.push($.SUBRULE($.layoutFor, { ARGS: [options, true] })) },
					{ ALT: () => items.push($.SUBRULE($.layoutRepeat, { ARGS: [options, true] })) },
					{ ALT: () => items.push($.SUBRULE($.layoutText, { ARGS: [options, true] })) },
					{ ALT: () => items.push($.SUBRULE($.layoutMenuItemGroup, { ARGS: [options] })) },
				]);
			});

			$.CONSUME(tokens.CloseCurly);

			return items;
		});
	}
	static layoutMenuItemGroup($) {
		return $.RULE("layoutMenuItemGroup", (options) => {
			$.CONSUME(tokens.Item);

			const result: TMenuItemGroup = {
				type: OP_TYPES.GROUP,
				items: [],
			};

			$.OPTION(() => {
				result.action = $.SUBRULE($.layoutAction);
			});

			$.CONSUME(tokens.OpenCurly);

			$.AT_LEAST_ONE(() => {
				const item = $.OR([{ ALT: () => $.SUBRULE($.layoutText, { ARGS: [options] }) }, { ALT: () => $.SUBRULE($.layoutSprite, { ARGS: [options] }) }]);
				result.items.push(item);
			});

			$.CONSUME(tokens.CloseCurly);

			return result;
		});
	}
	static layoutMenuSelection($) {
		return $.RULE("layoutMenuSelection", () => {
			$.CONSUME(tokens.Selection);
			$.CONSUME(tokens.OpenCurly);

			const selection = {};

			$.AT_LEAST_ONE(() => {
				const { name, value } = $.OR([
					{ ALT: () => $.SUBRULE($.layoutMenuSelectionSprite) },
					{ ALT: () => $.SUBRULE($.background) },
					{ ALT: () => $.SUBRULE($.layoutMenuSelectionColor) },
					{ ALT: () => ({ name: "var", value: $.CONSUME(tokens.Variable).image.substring(1) }) },
				]);
				selection[name] = value;
			});

			$.CONSUME(tokens.CloseCurly);

			return selection;
		});
	}
	static layoutMenuSelectionColor($) {
		return $.RULE("layoutMenuSelectionColor", () => {
			$.CONSUME(tokens.Color);
			return { name: "color", value: $.SUBRULE($.htmlColor) };
		});
	}
	static layoutMenuSelectionSprite($) {
		return $.RULE("layoutMenuSelectionSprite", () => {
			const name = $.OR([{ ALT: () => $.CONSUME(tokens.Left).image }, { ALT: () => $.CONSUME(tokens.Right).image }]);
			const value = $.CONSUME(tokens.StringLiteral).payload;
			return { name, value };
		});
	}
}
