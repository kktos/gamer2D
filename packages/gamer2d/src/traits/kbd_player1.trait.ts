import type { Entity } from "../entities/Entity";
import type { GameContext } from "../game/types/GameContext";
import type { Scene } from "../scenes/Scene";
import { DIRECTIONS } from "../types/direction.type";
import { Trait } from "./Trait";

export class KeyboardPlayerOneTrait extends Trait {
	update(gc: GameContext, entity: Entity, _scene: Scene) {
		if (entity.isFixed) return;

		if (gc.keys.get("ArrowLeft")) {
			entity.vel.x = -150;
			entity.dir = DIRECTIONS.LEFT;
		}
		if (gc.keys.get("ArrowRight")) {
			entity.vel.x = 150;
			entity.dir = DIRECTIONS.RIGHT;
		}
	}
}
