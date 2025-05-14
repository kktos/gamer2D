import type { Entity } from "../entities/Entity";
import type { GameContext } from "../game/types/GameContext";
import type { Scene } from "../scene/Scene";
import { Trait } from "./Trait";
import type { KillableTrait } from "./killable.trait";

export class KillIfOffscreenTrait extends Trait {
	update(gc: GameContext, entity: Entity, scene: Scene) {
		if (scene.bbox.contains(entity.bbox)) return;
		entity.useTrait("KillableTrait", (trait: KillableTrait) => trait.kill());
	}
}
