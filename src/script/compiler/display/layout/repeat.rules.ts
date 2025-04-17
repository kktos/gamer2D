import { OP_TYPES } from "../../../../types/operation.types";
import type { TupleToUnion } from "../../../../types/typescript.types";
import { tokens } from "../../lexer";
import type { TMenuItemGroup } from "./menu.rules";
import type { TSprite } from "./sprite.rules";
import type { TText } from "./text.rules";

/*
		repeat count:5 var:idx step:{ at:0,50 } {				
			item {
				text "toto" at:300,200
			}
		}
 */

export type TRepeatItem = TSprite | TText | TMenuItemGroup;
export type TRepeat = {
	type: TupleToUnion<[typeof OP_TYPES.REPEAT]>;
	from: number | string;
	count: number | string;
	step: {
		pos: [number, number];
	};
	items: TRepeatItem[];
	var?: string;
	list?: string;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class RepeatRules {
	static layoutRepeat($) {
		return $.RULE("layoutRepeat", (options, isMenuItem: boolean) => {
			$.CONSUME(tokens.Repeat);

			let result: TRepeat = { type: OP_TYPES.REPEAT, from: 0, count: 0, step: { pos: [0, 0] }, items: [] };

			const parms = $.SUBRULE($.layoutRepeatParms, {
				ARGS: [options, isMenuItem],
			});

			$.ACTION(() => {
				if (parms.count === undefined || parms.step === undefined)
					throw new TypeError(`Missing required parm (count, step) for Repeat : ${JSON.stringify(parms)}`);
			});

			result = { ...result, ...parms };

			$.CONSUME(tokens.OpenCurly);

			result.items = $.SUBRULE($.layoutRepeatItems, {
				ARGS: [options, isMenuItem],
			});

			$.CONSUME(tokens.CloseCurly);

			return result;
		});
	}

	static layoutRepeatParms($) {
		return $.RULE("layoutRepeatParms", () => {
			const parms = {};
			$.AT_LEAST_ONE(() => {
				const parm = $.SUBRULE($.layoutRepeatParm);
				if (parms[parm[0]]) throw new TypeError(`Duplicate parm for Repeat : ${parm[0]}`);
				parms[parm[0]] = parm[1];
			});
			return parms;
		});
	}

	static layoutRepeatParm($) {
		return $.RULE("layoutRepeatParm", () => {
			let value: unknown;

			const name = $.OR([{ ALT: () => $.CONSUME(tokens.Identifier) }, { ALT: () => $.CONSUME(tokens.Step) }]).image?.toLowerCase();

			$.CONSUME(tokens.Colon);

			switch (name) {
				case "count":
					value = $.SUBRULE($.numOrVar);
					break;
				case "var":
					value = $.CONSUME(tokens.Identifier).image;
					break;
				case "step":
					value = $.SUBRULE($.layoutRepeatParmStep);
					break;

				default:
					$.ACTION(() => {
						throw new TypeError(`Invalid parm for Repeat : ${name}`);
					});
			}

			return [name, value];
		});
	}

	static layoutRepeatParmStep($) {
		return $.RULE("layoutRepeatParmStep", () => {
			$.CONSUME(tokens.OpenCurly);
			const result = $.SUBRULE($.parm_at);
			$.CONSUME(tokens.CloseCurly);
			return { pos: result };
		});
	}

	static layoutRepeatItems($) {
		return $.RULE("layoutRepeatItems", (options, isMenuItem) => {
			const items: TRepeatItem[] = [];
			$.AT_LEAST_ONE(() => {
				const item = $.OR([
					{ ALT: () => $.SUBRULE($.layoutText, { ARGS: [options, isMenuItem] }) },
					{ ALT: () => $.SUBRULE($.layoutSprite, { ARGS: [options] }) },
					{ ALT: () => $.SUBRULE($.layoutMenuItem, { ARGS: [options] }) },
				]);
				items.push(item);
			});
			return items;
		});
	}
}
