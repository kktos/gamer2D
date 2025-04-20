import type { TMath } from "../../script/compiler/display/layout/math.rules";
import type { TRepeat, TRepeatItem } from "../../script/compiler/display/layout/repeat.rules";
import type { TSprite } from "../../script/compiler/display/layout/sprite.rules";
import type { TText } from "../../script/compiler/display/layout/text.rules";
import { evalNumber, evalString } from "../../script/engine/eval.script";
import type { TVarTypes, TVars } from "../../types/engine.types";
import { OP_TYPES } from "../../types/operation.types";
import { ArgVariable } from "../../types/value.types";
import { clone } from "../../utils/object.util";

export function repeat(op: TRepeat, callback: (item: Exclude<TRepeatItem, TMath>) => void, vars: TVars) {
	let count = 0;
	let from = 0;
	let list: TVarTypes[] | null = null;

	// console.log("TRepeat", op);

	if (op.list) {
		list = Array.isArray(op.list) ? op.list : (vars.get(op.list) as TVarTypes[]);
		count = list.length;
	} else {
		// count = evalExpr({ vars }, op.count) as number;
		count = (op.count instanceof ArgVariable ? vars.get(op.count.value) : op.count) as number;
		from = op.from;
	}

	for (let idx = from; idx < from + count; idx++) {
		if (op.var) {
			vars.set(op.var, list ? list[idx] : idx);
		}

		for (let itemIdx = 0; itemIdx < op.items.length; itemIdx++) {
			const item = clone<TRepeatItem>(op.items[itemIdx]);
			if (item.type === OP_TYPES.GROUP) {
				for (const groupItem of item.items) {
					processItem(groupItem, idx, vars);
				}
			} else {
				processItem(item, idx, vars);
			}

			if (item.type !== OP_TYPES.MATH) callback(item);
		}
	}
}

function processItem(item: TSprite | TText | TMath, idx: number, vars: TVars) {
	switch (item.type) {
		case OP_TYPES.TEXT:
			item.text = evalString({ vars }, item.text);
			item.pos[0] = evalNumber({ vars }, item.pos[0]);
			item.pos[1] = evalNumber({ vars }, item.pos[1]);
			break;
		case OP_TYPES.SPRITE:
			item.sprite = evalString({ vars }, item.sprite);
			item.pos[0] = evalNumber({ vars }, item.pos[0]);
			item.pos[1] = evalNumber({ vars }, item.pos[1]);
			break;
		case OP_TYPES.MATH:
			switch (item.fn) {
				case "add": {
					const varName = item.params[0] as string;
					const inc = item.params[1] as number;
					vars.set(varName, (vars.get(varName) as number) + inc);
					break;
				}
			}
			break;
	}

	// (item.pos as number[])[0] += (idx - from) * op.step.pos[0];
	// (item.pos as number[])[1] += (idx - from) * op.step.pos[1];
}
