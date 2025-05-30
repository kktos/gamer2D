import type { Entity } from "../entities/Entity";
import type { Scene } from "../scene/Scene";
import { Trait } from "./Trait";

export class MouseXTrait extends Trait {
	update(gc, entity: Entity, scene: Scene) {
		if (entity.isFixed) return;

		entity.bbox.left = gc.mouse.x;
		entity.bbox.clampTo(scene.bbox);
	}
}
