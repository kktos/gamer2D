import type { Entity } from "../entities/Entity";
import type { GameContext } from "../game/types/GameContext";
import type { Scene } from "../scenes/Scene";
import { Trait } from "./Trait";
import { setupTrait } from "./Trait.factory";
import type { KillableTrait } from "./killable.trait";

export class KillIfOffscreenTrait extends Trait {
	update(_gc: GameContext, entity: Entity, scene: Scene) {
		if (scene.bbox.contains(entity.bbox)) return;
		entity.useTrait("KillableTrait", (trait: KillableTrait) => trait.kill());
	}
}
setupTrait({ name: "KillIfOffscreenTrait", alias: "KillIfOffscreen", classType: KillIfOffscreenTrait });
