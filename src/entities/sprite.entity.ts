import type ResourceManager from "../game/ResourceManager";
import AnimationTrait from "../traits/animation.trait";
import { Entity } from "./Entity";

export default class SpriteEntity extends Entity {
	private isAnimSprite: boolean;

	constructor(resourceMgr: ResourceManager, sprite: string, x: number, y: number) {
		const [sheet, spriteName] = sprite.split(":");

		super(resourceMgr, x, y, sheet);

		// this.isFixed = false;

		this.isAnimSprite = !!spriteName.match(/^@/);
		if (this.isAnimSprite) {
			const animTrait = new AnimationTrait();
			this.addTrait(animTrait);
			animTrait.setAnim(this, spriteName.substring(1));
		} else {
			this.setSprite(spriteName);
		}
	}

	render(gc) {
		const ctx = gc.viewport.ctx;
		if (this.currSprite) this.spritesheet?.draw(this.currSprite, ctx, this.left, this.top);
	}
}
