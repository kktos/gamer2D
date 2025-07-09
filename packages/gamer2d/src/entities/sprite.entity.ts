import { AnimationTrait } from "../traits/animation.trait";
import { DIRECTIONS } from "../types/direction.type";
import { Entity } from "./Entity";
import { setupEntity } from "./Entity.factory";

type SpriteDTO = {
	at: {
		x: number;
		y: number;
	};
};
export class SpriteEntity extends Entity {
	constructor(sprite: string, spriteDTO: SpriteDTO) {
		const [sheetFilename, spriteName] = sprite.split(":");

		if (!spriteName) throw new TypeError(`Need a SpriteSheet and a Name for Sprite "${sprite}"`);

		super(spriteDTO.at.x, spriteDTO.at.y, sheetFilename);

		this.isFixed = false;

		const isAnimatedSprite = !!spriteName.match(/^@/);
		if (isAnimatedSprite) {
			const animTrait = new AnimationTrait();
			this.addTrait(animTrait);
			animTrait.setAnim(this, spriteName.substring(1));
		} else {
			this.setSprite(spriteName);
		}
	}

	public setSprite(name: string): void {
		const parts = name.split(":");
		const spriteName = parts.length > 1 ? parts[1] : name;
		super.setSprite(spriteName);
	}

	render(gc) {
		const ctx = gc.viewport.ctx;
		if (this.currSprite)
			this.spritesheet?.draw(this.currSprite, ctx, this.bbox.left, this.bbox.top, { flip: this.dir === DIRECTIONS.RIGHT ? 1 : 0, zoom: this.zoom });
	}
}

// Register this entity with the factory
setupEntity({ name: "sprite", classType: SpriteEntity });
// It will also be registered by its class name "SpriteEntity" internally by setupEntity,
// which is used by the createEntityByName fallback.
