import type { ResourceManager } from "../game/ResourceManager";
import { Entity } from "./Entity";
import { setupEntity } from "./Entity.factory";

type zoneDTO = {
	at: {
		x: number;
		y: number;
	};
	width: number;
	height: number;
};

export class ZoneEntity extends Entity {
	constructor(resourceMgr: ResourceManager, zoneDTO: zoneDTO) {
		super(resourceMgr, zoneDTO.at.x, zoneDTO.at.y);
		this.isFixed = true;
		this.bbox.setSize(zoneDTO.width, zoneDTO.height);
	}

	// empty render to overload the default grey square
	render(_gc) {
		// 	const ctx = gc.viewport.ctx;
		// 	ctx.fillStyle = "red";
		// 	ctx.fillRect(this.bbox.left, this.bbox.top, this.bbox.width, this.bbox.height);
	}
}

// Register this entity with the factory
setupEntity({ name: "*", classType: ZoneEntity });
