import type { ResourceManager } from "../game/ResourceManager";
import { Entity } from "./Entity";
import { setupEntity } from "./Entity.factory";

export class ZoneEntity extends Entity {
	constructor(resourceMgr: ResourceManager, x: number, y: number, width: number, height: number) {
		super(resourceMgr, x, y);
		this.isFixed = true;
		this.bbox.setSize(width, height);
	}

	render(gc) {
		const _ctx = gc.viewport.ctx;
	}
}

// Register this entity with the factory
setupEntity({ name: "*", classType: ZoneEntity });
