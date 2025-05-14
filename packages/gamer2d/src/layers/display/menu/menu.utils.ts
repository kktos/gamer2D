import type GameContext from "../../../game/types/GameContext";
import { BBox } from "../../../maths/BBox.class";
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
				const { ss, sprite } = loadSprite(gc, item.name);
				const size = ss.spriteSize(sprite);
				const bbox = BBox.create({
					left: item.pos[0],
					top: item.pos[1],
					width: size.width,
					height: size.height,
				});
				item.bbox = () => bbox;
				break;
			}
			case OP_TYPES.GROUP: {
				computeBBox(gc, layer, item.items);
				item.bbox = () => {
					const bbox = BBox.createSmallest();
					for (let idx = 0; idx < item.items.length; idx++) bbox.mergeWith(item.items[idx].bbox());
					return bbox;
				};
				break;
			}
		}
	}
	return bbox;
}
