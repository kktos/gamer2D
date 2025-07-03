import type { Entity } from "../entities/Entity";
import type { GameContext } from "../game/types/GameContext";
import type { Scene } from "../scene/Scene";
import { Trait } from "./Trait";
import { setupTrait } from "./Trait.factory";

export class OffscreenTrait extends Trait {
	static EVENT_OFF_SCREEN = Symbol.for("OFF_SCREEN");

	update(_gc: GameContext, entity: Entity, scene: Scene) {
		if (scene.bbox.contains(entity.bbox)) return;
		// entity.queue(OffscreenTrait.EVENT_OFF_SCREEN, entity);
		scene.emit(OffscreenTrait.EVENT_OFF_SCREEN, entity);
	}
}
setupTrait({ name: "OffscreenTrait", alias: "Offscreen", classType: OffscreenTrait });
