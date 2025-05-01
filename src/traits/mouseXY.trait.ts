import type { Entity } from "../entities/Entity";
import type GameContext from "../game/types/GameContext";
import type { Scene } from "../scene/Scene";
import { Trait } from "./Trait";

export class MouseXYTrait extends Trait {
	update(gc: GameContext, entity: Entity, scene: Scene) {
		if (entity.isFixed) return;

		const bbox = scene.bbox;

		entity.left = gc.mouse.x;
		if (entity.left < bbox.left) entity.left = bbox.left;
		else if (entity.right > bbox.right) entity.right = bbox.right;

		entity.top = gc.mouse.y;
		if (entity.top < bbox.top) entity.left = bbox.top;
		else if (entity.bottom > bbox.bottom) entity.bottom = bbox.bottom;
	}
}
