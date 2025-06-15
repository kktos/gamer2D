import type { ResourceManager } from "../game/ResourceManager";
import { Entity } from "./Entity";
import { setupEntity } from "./Entity.factory";

export class BackgroundEntity extends Entity {
	private type: string;

	constructor(resourceMgr: ResourceManager, type: string) {
		super(resourceMgr, 0, 0, "backgrounds");

		this.type = type;
		this.setSprite(this.type);
	}

	collides() {}

	update() {}

	draw(ctx: CanvasRenderingContext2D, col: number, row: number) {
		if (this.currSprite) this.spritesheet?.draw(this.currSprite, ctx, col * this.bbox.width, row * this.bbox.height);
	}
}

// Register this entity with the factory
setupEntity({ name: "background", classType: BackgroundEntity });
