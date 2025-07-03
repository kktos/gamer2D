import type { ResourceManager } from "../game/ResourceManager";
import { Entity } from "./Entity";
import { setupEntity } from "./Entity.factory";

export type RectDTO = {
	x: number;
	y: number;
	width: number;
	height: number;
	strokecolor?: string;
	fillcolor?: string;
};

export class RectEntity extends Entity {
	public strokecolor: string | undefined;
	public fillcolor: string | undefined;

	constructor(resourceMgr: ResourceManager, rectObj: RectDTO) {
		super(resourceMgr, rectObj.x, rectObj.y);
		this.strokecolor = rectObj.strokecolor;
		this.fillcolor = rectObj.fillcolor;
		this.bbox.setSize(rectObj.width, rectObj.height);
		// to allow animations
		this.isFixed = false;
	}

	render(gc) {
		const ctx = gc.viewport.ctx;

		if (this.fillcolor) {
			ctx.fillStyle = this.fillcolor;
			ctx.fillRect(this.bbox.left, this.bbox.top, this.bbox.width, this.bbox.height);
		}
		if (this.strokecolor) {
			ctx.strokeStyle = this.strokecolor;
			ctx.strokeRect(this.bbox.left, this.bbox.top, this.bbox.width, this.bbox.height);
		}
	}
}

// Register this entity with the factory
setupEntity({ name: "rect", classType: RectEntity });
