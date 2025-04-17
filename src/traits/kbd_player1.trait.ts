import type { Entity } from "../entities/Entity";
import type { Scene } from "../scene/Scene";
import { DIRECTIONS } from "../types/direction.type";
import { Trait } from "./Trait";

export class KeyboardPlayerOneTrait extends Trait {
	update(gc, entity: Entity, scene: Scene) {
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
