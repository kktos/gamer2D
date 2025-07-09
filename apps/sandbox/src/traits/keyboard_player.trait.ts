import type { Entity } from "gamer2d/entities/Entity";
import type { GameContext } from "gamer2d/game/index";
import type { Scene } from "gamer2d/scenes/Scene";
import { Trait } from "gamer2d/traits/Trait";
import { DIRECTIONS } from "gamer2d/types/direction.type";
import type { JumpTrait } from "./jump.trait.js";

export class KeyboardPlayerTrait extends Trait {
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
		if (gc.keys.get(" ")) {
			entity.useTrait("JumpTrait", (trait: JumpTrait) => trait.start());
		}
	}
}
