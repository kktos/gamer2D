import type { Entity } from "../entities/Entity";
import Anim from "../game/Anim";
import type GameContext from "../game/types/GameContext";
import { Trait } from "./Trait";

export default class AnimationTrait extends Trait {
	public anim: Anim | null;

	constructor() {
		super();
		this.anim = null;
	}

	setAnim(entity: Entity, name: string) {
		const anim = entity.spritesheet?.animations.get(name);
		if (!anim) throw new Error(`Unknown animation ${name} for ${entity.constructor}`);

		this.anim = Anim.clone(anim);
		return this.anim;
	}

	start() {
		if (!this.anim) return;
		return this.anim.reset();
	}

	stop() {
		if (!this.anim) return;
		this.anim.pause();
	}

	update(_: GameContext, entity: Entity) {
		if (!this.anim) return;
		entity.setSprite(this.anim.frame(entity.lifetime));
	}
}
