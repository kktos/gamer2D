import type { Entity } from "../entities/Entity";
import Anim from "../game/Anim";
import type GameContext from "../game/types/GameContext";
import { Trait } from "./Trait";

export default class AnimationTrait extends Trait {
	public anim: Anim | undefined;

	private animCache: Map<string, Anim>;

	constructor() {
		super();
		this.anim = undefined;
		this.animCache = new Map();
	}

	setAnim(entity: Entity, name: string) {
		this.anim = this.animCache.get(name);

		if (!this.anim) {
			const anim = entity.spritesheet?.animations.get(name);
			if (!anim) throw new Error(`Unknown animation ${name} for ${entity.constructor}`);

			this.anim = Anim.clone(anim);
			this.animCache.set(name, this.anim);
		}

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
