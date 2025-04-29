import type GameContext from "../../../game/types/GameContext";
import type { BBox } from "../../../maths/math";
import type { TMenuItemRendered } from "../../../script/compiler/layers/display/layout/menu.rules";
import { OP_TYPES } from "../../../types/operation.types";
import type { DisplayLayer } from "../../display.layer";
import { loadSprite } from "../sprite.renderer";
import { addText } from "../text.manager";

export function computeBBox(gc: GameContext, layer: DisplayLayer, items: TMenuItemRendered[]) {
	const bbox: BBox | null = null;
	for (let idx = 0; idx < items.length; idx++) {
		const item = items[idx];
		switch (item.type) {
			case OP_TYPES.TEXT: {
				const textEntity = addText(layer, item);
				item.bbox = () => textEntity.bbox;
				item.entity = textEntity;
				if (item.align) layer.font.align = item.align;
				if (item.size) layer.font.size = item.size;
				break;
			}
			case OP_TYPES.IMAGE:
			case OP_TYPES.SPRITE: {
				const { ss, sprite } = loadSprite(gc, item.sprite);
				const size = ss.spriteSize(sprite);
				const bbox: BBox = {
					left: item.pos[0],
					top: item.pos[1],
					right: item.pos[0] + size.x,
					bottom: +item.pos[1] + size.y,
				};
				item.bbox = () => bbox;
				break;
			}
			case OP_TYPES.GROUP: {
				computeBBox(gc, layer, item.items);
				item.bbox = () => {
					const bbox = {
						left: Number.POSITIVE_INFINITY,
						top: Number.POSITIVE_INFINITY,
						right: Number.NEGATIVE_INFINITY,
						bottom: Number.NEGATIVE_INFINITY,
					};
					for (let idx = 0; idx < item.items.length; idx++) {
						const currBBox = item.items[idx].bbox();
						bbox.left = Math.min(bbox.left, currBBox.left);
						bbox.top = Math.min(bbox.top, currBBox.top);

						bbox.right = Math.max(bbox.right, currBBox.right);
						bbox.bottom = Math.max(bbox.bottom, currBBox.bottom);
					}
					return bbox;
				};
				break;
			}
		}
	}
	return bbox;
}
