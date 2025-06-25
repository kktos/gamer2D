import type { Entity } from "../entities/Entity";
import type { GameContext } from "../game/types/GameContext";
import type { Scene } from "../scene/Scene";
import type { KillableTrait } from "./killable.trait";
import { Trait } from "./Trait";

export class KillIfOffscreenTrait extends Trait {
	update(_gc: GameContext, entity: Entity, scene: Scene) {
		if (scene.bbox.contains(entity.bbox)) return;
		entity.useTrait("KillableTrait", (trait: KillableTrait) => trait.kill());
	}
}
