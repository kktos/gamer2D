import type { Entity } from "../entities/Entity";
import type GameContext from "../game/types/GameContext";
import type { Scene } from "../scene/Scene";
import { Trait } from "./Trait";

export class OffscreenTrait extends Trait {
	static EVENT_OFF_SCREEN = Symbol.for("OFF_SCREEN");

	update(gc: GameContext, entity: Entity, scene: Scene) {
		if (scene.bbox.left <= entity.left && entity.left <= scene.bbox.right && entity.bottom <= scene.bbox.bottom && entity.top >= scene.bbox.top) return;
		entity.queue(OffscreenTrait.EVENT_OFF_SCREEN, entity);
	}
}
