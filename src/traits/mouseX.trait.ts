import type { Entity } from "../entities/Entity";
import type { Scene } from "../scene/Scene";
import { Trait } from "./Trait";

export class MouseXTrait extends Trait {
	update(gc, entity: Entity, scene: Scene) {
		if (entity.isFixed) return;

		const bbox = scene.bbox;
		entity.left = gc.mouse.x;
		if (entity.left < bbox.left) entity.left = bbox.left;
		else if (entity.right > bbox.right) entity.left = bbox.right - entity.width;
	}
}
