import type { TImage } from "../../script/compiler/layers/display/layout/image.rules";
import type { TRepeat, TRepeatItem } from "../../script/compiler/layers/display/layout/repeat.rules";
import type { TSprite } from "../../script/compiler/layers/display/layout/sprite.rules";
import type { TText } from "../../script/compiler/layers/display/layout/text.rules";
import { evalExpr, evalNumberValue, evalString, evalVar } from "../../script/engine/eval.script";
import { OP_TYPES } from "../../types/operation.types";
import { ArgExpression, ArgVariable, ValueTrait } from "../../types/value.types";
import { clone } from "../../utils/object.util";
import type { TVarTypes, TVars } from "../../utils/vars.utils";

export function repeat(op: TRepeat, callback: (item: TRepeatItem) => void, vars: TVars) {
	let count = 0;
	let from = 0;
	let list: TVarTypes[] = [];

	// console.log("TRepeat", op);

	if (op.list) {
		list = Array.isArray(op.list) ? op.list : (vars.get(op.list) as TVarTypes[]);
		count = list.length;
	} else {
		//count = (op.count instanceof ArgVariable ? vars.get(op.count.value) : op.count) as number;
		count = evalNumberValue({ vars }, op.count);
		// from = op.from ?? 0;
		from = op.from ? evalNumberValue({ vars }, op.from) : 0;
	}

	for (let idx = from; idx < from + count; idx++) {
		if (op.var) vars.set(op.var, list[idx]);
		if (op.index) vars.set(op.index, idx);

		for (let itemIdx = 0; itemIdx < op.items.length; itemIdx++) {
			const item = clone<TRepeatItem>(op.items[itemIdx]);
			if (item.type === OP_TYPES.GROUP) {
				for (const groupItem of item.items) {
					processItem(groupItem, idx, vars);
				}
			} else {
				processItem(item, idx, vars);
			}

			callback(item);
		}
	}
}

function processItem(item: TSprite | TText | TImage, idx: number, vars: TVars) {
	switch (item.type) {
		case OP_TYPES.TEXT:
			item.text = evalString({ vars }, item.text);
			break;
		case OP_TYPES.IMAGE:
		case OP_TYPES.SPRITE:
			item.name = evalString({ vars }, item.name);
			break;
	}

	item.pos[0] = evalNumberValue({ vars }, item.pos[0]);
	item.pos[1] = evalNumberValue({ vars }, item.pos[1]);

	// TODO: delay the eval until instanciation of the SPRITE|TEXT|IMAGE
	// here, we do an immediate evaluation because of the loop iterator
	// we need to find a way to add the iterator value...
	if ("traits" in item && Array.isArray(item.traits)) {
		for (const trait of item.traits) {
			if (trait instanceof ValueTrait)
				for (let idx = 0; idx < trait.args.length; idx++) {
					const arg = trait.args[idx];
					if (arg instanceof ArgVariable) {
						trait.args[idx] = evalVar({ vars }, arg.value);
						continue;
					}
					if (arg instanceof ArgExpression) {
						trait.args[idx] = evalExpr({ vars }, arg);
					}
				}
		}
	}
}
