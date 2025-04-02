import { Entity } from "./Entity";

export default class BackgroundEntity extends Entity {
	private type: string;

	constructor(resourceMgr, type) {
		super(resourceMgr, 0, 0, "backgrounds");

		this.type = type;
		this.setSprite(this.type);
	}

	collides() {}

	update() {}

	draw(ctx, col, row) {
		if (this.currSprite) this.spritesheet?.draw(this.currSprite, ctx, col * this.size.x, row * this.size.y);
	}
}
