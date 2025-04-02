import { Trait } from "./Trait";

export default class MouseXTrait extends Trait {
	update(gc, entity, scene) {
		const bbox = scene.bbox;
		entity.left = gc.mouse.x;
		if (entity.left < bbox.x) entity.left = bbox.x;
		else if (entity.right > bbox.dx) entity.left = bbox.dx - entity.size.x;
	}
}
