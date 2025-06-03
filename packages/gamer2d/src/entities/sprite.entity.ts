import type { ResourceManager } from "../game/ResourceManager";
import { AnimationTrait } from "../traits/animation.trait";
import { DIRECTIONS } from "../types/direction.type";
import { Entity } from "./Entity";

export class SpriteEntity extends Entity {
	private isAnimSprite: boolean;

	constructor(resourceMgr: ResourceManager, sprite: string, x: number, y: number) {
		const [sheet, spriteName] = sprite.split(":");

		if (!spriteName) throw new TypeError(`Need a SpriteSheet and a Name for Sprite "${sprite}"`);

		super(resourceMgr, x, y, sheet);

		this.isFixed = false;

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
		if (this.currSprite) this.spritesheet?.draw(this.currSprite, ctx, this.bbox.left, this.bbox.top, { flip: this.dir === DIRECTIONS.RIGHT ? 1 : 0, zoom: 1 });
	}
}
