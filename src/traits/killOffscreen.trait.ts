import type { Entity } from "../entities/Entity";
import type GameContext from "../game/GameContext";
import type { Scene } from "../scene/Scene";
import { Trait } from "./Trait";
import KillableTrait from "./killable.trait";

export default class KillIfOffscreenTrait extends Trait {
	update(gc: GameContext, entity: Entity, scene: Scene) {
		if (scene.bbox.left <= entity.left && entity.left <= scene.bbox.right && entity.top <= scene.bbox.bottom) return;
		const trait = entity.traits.get(KillableTrait) as KillableTrait;
		if (trait) trait.kill();
	}
}
