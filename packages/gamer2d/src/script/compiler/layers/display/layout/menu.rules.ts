import type { BBox } from "../../../../../maths/BBox.class";
import { OP_TYPES } from "../../../../../types/operation.types";
import type { TupleToUnion } from "../../../../../types/typescript.types";
import type { ArgColor } from "../../../../../types/value.types";
import { tokens } from "../../../lexer";
import type { TImage } from "./image.rules";
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
	background?: ArgColor;
	left?: string;
	right?: string;
	var?: string;
};
export type TMenuItemGroup = {
	type: TupleToUnion<[typeof OP_TYPES.GROUP]>;
	items: (TSprite | TText)[];
	action?: unknown[];

	bbox: () => BBox;
};
export type TMenuItemRendered = TMenuItemGroup | TText | TSprite | TImage;
export type TMenuItem = TRepeat | TMenuItemRendered;

export type TMenu = {
	type: TupleToUnion<[typeof OP_TYPES.MENU]>;
	items: TMenuItem[];
	selection?: TMenuSelection;
	keys?: { previous?: string[]; next?: string[]; select?: string[] };
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class MenuRules {
	static layoutMenu($) {
		return $.RULE("layoutMenu", (options) => {
			const result: TMenu = { type: OP_TYPES.MENU, items: [] };

			// menu {
			$.CONSUME(tokens.Menu);
			$.CONSUME(tokens.OpenCurly);

			// selection { ... }
			result.selection = $.OPTION(() => $.SUBRULE($.layoutMenuSelection));
			// keys { ... }
			result.keys = $.OPTION2(() => $.SUBRULE($.layoutMenuKeys));
			// items { ... }
			result.items = $.SUBRULE($.layoutMenuItems, { ARGS: [options] });

			// } end of menu
			$.CONSUME(tokens.CloseCurly);

			return result;
		});
	}

	static layoutMenuItems($) {
		return $.RULE("layoutMenuItems", (options) => {
			// items {
			$.CONSUME(tokens.Items);
			$.CONSUME(tokens.OpenCurly);

			const items: unknown[] = [];
			$.AT_LEAST_ONE(() => {
				$.OR([
					{ ALT: () => items.push($.SUBRULE($.layoutFor, { ARGS: [options, true] })) },
					{ ALT: () => items.push($.SUBRULE($.layoutRepeat, { ARGS: [options, true] })) },
					{ ALT: () => items.push($.SUBRULE($.layoutText, { ARGS: [options, true] })) },
					{ ALT: () => items.push($.SUBRULE($.layoutMenuItemGroup, { ARGS: [options, true] })) },
				]);
			});
			// } end of items
			$.CONSUME(tokens.CloseCurly);

			return items;
		});
	}

	static layoutMenuItemGroup($) {
		return $.RULE("layoutMenuItemGroup", (options, isMenuItem) => {
			$.CONSUME(tokens.Item);

			// const result: Partial<TMenuItemGroup> = {
			const result: Pick<TMenuItemGroup, "type" | "items" | "action"> = {
				type: OP_TYPES.GROUP,
				items: [],
			};

			$.CONSUME(tokens.OpenCurly);
			$.AT_LEAST_ONE(() => {
				const item = $.OR([{ ALT: () => $.SUBRULE($.layoutText, { ARGS: [options] }) }, { ALT: () => $.SUBRULE($.layoutSprite, { ARGS: [options] }) }]);
				result.items.push(item);
			});
			$.CONSUME(tokens.CloseCurly);

			// action: { <statements> } OPTIONAL as user can manage is with events
			$.OPTION(() => {
				result.action = $.SUBRULE($.layoutAction);
			});

			return result;
		});
	}

	static layoutMenuKeys($) {
		return $.RULE("layoutMenuKeys", () => {
			$.CONSUME(tokens.Keys);
			$.CONSUME(tokens.OpenCurly);

			const keys: TMenu["keys"] = {};

			$.AT_LEAST_ONE(() => {
				const name = $.CONSUME(tokens.Identifier).image;
				$.CONSUME(tokens.Colon);

				$.CONSUME(tokens.OpenBracket);
				const list: string[] = [];
				$.MANY_SEP({
					SEP: tokens.Comma,
					DEF: () => {
						list.push($.CONSUME2(tokens.StringLiteral).payload);
					},
				});
				$.CONSUME(tokens.CloseBracket);
				keys[name] = list;
			});

			$.CONSUME(tokens.CloseCurly);

			return keys;
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
					{ ALT: () => $.SUBRULE($.layoutMenuSelectionBackground) },
					{ ALT: () => $.SUBRULE($.layoutMenuSelectionColor) },
					{ ALT: () => $.SUBRULE($.layoutMenuSelectionVar) },
				]);
				selection[name] = value;
			});

			$.CONSUME(tokens.CloseCurly);

			return selection;
		});
	}

	static layoutMenuSelectionVar($) {
		return $.RULE("layoutMenuSelectionVar", () => {
			$.CONSUME(tokens.Var);
			return { name: "var", value: $.CONSUME(tokens.Variable).image.substring(1) };
		});
	}

	static layoutMenuSelectionBackground($) {
		return $.RULE("layoutMenuSelectionBackground", () => {
			$.CONSUME(tokens.Background);
			const value = $.OR([{ ALT: () => $.SUBRULE($.number) }, { ALT: () => $.SUBRULE($.htmlColor) }]);
			return { name: "background", value };
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
			const name = $.OR([{ ALT: () => $.CONSUME(tokens.Left) }, { ALT: () => $.CONSUME(tokens.Right) }]).image;
			const value = $.CONSUME(tokens.StringLiteral).payload;
			return { name, value };
		});
	}
}
