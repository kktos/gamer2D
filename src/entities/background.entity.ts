import type ResourceManager from "../game/ResourceManager";
import { Entity } from "./Entity";

export default class BackgroundEntity extends Entity {
	private type: string;

	constructor(resourceMgr: ResourceManager, type: string) {
		super(resourceMgr, 0, 0, "backgrounds");

		this.type = type;
		this.setSprite(this.type);
	}

	collides() {}

	update() {}

	draw(ctx: CanvasRenderingContext2D, col: number, row: number) {
		if (this.currSprite) this.spritesheet?.draw(this.currSprite, ctx, col * this.width, row * this.height);
	}
}
