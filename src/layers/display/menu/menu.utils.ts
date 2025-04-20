import type GameContext from "../../../game/GameContext";
import type { BBox } from "../../../maths/math";
import type { TMenuItemGroup } from "../../../script/compiler/display/layout/menu.rules";
import type { TSprite } from "../../../script/compiler/display/layout/sprite.rules";
import type { TText } from "../../../script/compiler/display/layout/text.rules";
import { evalNumber } from "../../../script/engine/eval.script";
import { OP_TYPES } from "../../../types/operation.types";
import type { DisplayLayer } from "../../display.layer";
import { loadSprite } from "../sprite.renderer";

export function computeBBox(gc: GameContext, layer: DisplayLayer, items: (TMenuItemGroup | TText | TSprite)[], isGroup = false) {
	let bbox: BBox | null = null;
	for (let idx = 0; idx < items.length; idx++) {
		const item = items[idx];
		switch (item.type) {
			case OP_TYPES.TEXT: {
				layer.addText(item);
				if (item.align) layer.font.align = item.align;
				if (item.size) layer.font.size = item.size;
				const left = evalNumber({ vars: layer.vars }, item.pos[0]);
				const top = evalNumber({ vars: layer.vars }, item.pos[1]);
				const r = layer.font.textRect(item.text, left, top);
				item.bbox = { left: r[0], top: r[1], right: r[2], bottom: r[3] };
				break;
			}
			case OP_TYPES.SPRITE: {
				const { ss, sprite } = loadSprite(gc, item.sprite);
				const size = ss.spriteSize(sprite);
				item.bbox = {
					left: item.pos[0],
					top: item.pos[1],
					right: item.pos[0] + size.x,
					bottom: +item.pos[1] + size.y,
				};
				break;
			}
			case OP_TYPES.GROUP: {
				item.bbox = computeBBox(gc, layer, item.items, true);
				break;
			}
		}
		if (isGroup && item.bbox) {
			if (bbox === null) {
				bbox = { ...item.bbox };
				continue;
			}
			if (item.bbox.left < bbox.left) {
				bbox.left = item.bbox.left;
			}
			if (item.bbox.top < bbox.top) {
				bbox.top = item.bbox.top;
			}
			if (item.bbox.right > bbox.right) {
				bbox.right = item.bbox.right;
			}
			if (item.bbox.bottom > bbox.bottom) {
				bbox.bottom = item.bbox.bottom;
			}
		}
	}
	return bbox;
}
