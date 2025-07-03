import type { Entity } from "../entities/Entity";
import type { GameContext } from "../game/types/GameContext";
import type { Scene } from "../scenes/Scene";
import { Trait } from "./Trait";
import { setupTrait } from "./Trait.factory";

export class MouseXYTrait extends Trait {
	update(gc: GameContext, entity: Entity, scene: Scene) {
		if (entity.isFixed) return;

		entity.bbox.setPosition(gc.mouse.x, gc.mouse.y);
		entity.bbox.clampTo(scene.bbox);
	}
}
setupTrait({ name: "MouseXYTrait", alias: "MouseXY", classType: MouseXYTrait });
