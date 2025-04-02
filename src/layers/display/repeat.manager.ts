import type { TRepeat, TRepeatItem } from "../../script/compiler/display/layout/repeat.rules";
import type { TSprite } from "../../script/compiler/display/layout/sprite.rules";
import type { TText } from "../../script/compiler/display/layout/text.rules";
import { evalExpr } from "../../script/engine/eval.script";
import { OP_TYPES } from "../../script/types/operation.types";
import type { TVarTypes, TVars } from "../../types/engine.types";
import { clone } from "../../utils/object.util";

export function repeat(op: TRepeat, callback: (item: TRepeatItem) => void, vars: TVars) {
	let count = 0;
	let from = 0;
	let list: TVarTypes[] | null = null;

	// console.log("TRepeat", op);

	if (op.list) {
		list = vars.get(op.list) as TVarTypes[];
		count = list.length;
	} else {
		count = evalExpr({ vars }, op.count) as number;
		from = evalExpr({ vars }, op.from) as number;
	}

	const processItem = (item: TText | TSprite, idx: number) => {
		switch (item.type) {
			case OP_TYPES.TEXT:
				(item as TText).text = evalExpr({ vars }, item.text) as string;
				break;
			case OP_TYPES.SPRITE:
				(item as TSprite).sprite = evalExpr({ vars }, (item as TSprite).sprite) as string;
				break;
		}
		item.pos[0] += (idx - from) * op.step.pos[0];
		item.pos[1] += (idx - from) * op.step.pos[1];
	};

	for (let idx = from; idx < from + count; idx++) {
		if (op.var) {
			vars.set(op.var, list ? list[idx] : idx);
		}

		for (let itemIdx = 0; itemIdx < op.items.length; itemIdx++) {
			const item = clone<TRepeatItem>(op.items[itemIdx]);

			if (item.type === OP_TYPES.GROUP) {
				for (const groupItem of item.items) {
					processItem(groupItem, idx);
				}
			} else {
				processItem(item, idx);
			}

			callback(item);
		}
	}
}

// repeatFor(op, callback: (item: TRepeatItem) => void) {
// 	const count = evalExpr({ vars: this.vars }, op.count) as number;
// 	const from = evalExpr({ vars: this.vars }, op.from) as number;

// 	for (let idx = from; idx < count; idx++) {
// 		if (op.var) this.vars.set(op.var, idx);

// 		for (let itemIdx = 0; itemIdx < op.items.length; itemIdx++) {
// 			const item = clone(op.items[itemIdx]);
// 			item.pos[0] += idx * op.step.pos[0];
// 			item.pos[1] += idx * op.step.pos[1];
// 			callback(item);
// 		}
// 	}
// }
