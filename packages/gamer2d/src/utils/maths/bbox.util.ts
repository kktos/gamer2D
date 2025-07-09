import { type Entity, TextEntity } from "../../entities";
import type { GameContext } from "../../game";
import { BBox } from "./BBox.class";

export function getBoundingBox(gc: GameContext, item: Entity | Entity[]) {
	const bbox = BBox.createSmallest();
	let entities: Entity[];

	if (Array.isArray(item)) entities = item;
	else entities = [item];

	for (const entity of entities) {
		// needs to render the text to get its bbox
		if (entity instanceof TextEntity) {
			entity.render(gc);
			const textBox = BBox.copy(entity.bbox);
			if (entity.alignWidth) {
				textBox.width = entity.alignWidth;
				textBox.left = entity.x.value;
			}
			if (entity.alignHeight) {
				textBox.height = entity.alignHeight;
				textBox.top = entity.y.value;
			}
			bbox.unionWith(textBox);
			continue;
		}
		bbox.unionWith(entity.bbox);
	}
	return bbox;
}
