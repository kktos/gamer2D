import type { Entity } from "../entities/Entity";
import type { GameContext } from "../game/types/GameContext";
import type { Scene } from "../scenes/Scene";
import type { BBox } from "../utils/maths/BBox.class";
import { type Grid, GridCell } from "../utils/maths/grid.math";
import { COLLISION_SIDES } from "../utils/maths/math";
import { Layer } from "./Layer.class";

type TCellRect = BBox & {
	width: number;
	height: number;
	color: string;
	isFrame?: boolean;
};

interface ICollisionGridCellX {
	collisionX(gc: GameContext, entity: Entity): void;
}
interface ICollisionGridCellY {
	collisionY(gc: GameContext, entity: Entity): void;
}

export class CollisionGridCell extends GridCell {
	collisionX(gc: GameContext, entity: Entity) {
		if (entity.vel.x > 0) {
			if (entity.bbox.right > this.left) entity.obstructedOn(gc, COLLISION_SIDES.RIGHT, this);
		} else if (entity.vel.x < 0) {
			if (entity.bbox.left < this.right) entity.obstructedOn(gc, COLLISION_SIDES.LEFT, this);
		}
	}

	collisionY(gc: GameContext, entity: Entity) {
		if (entity.vel.y > 0) {
			if (entity.bbox.bottom > this.top) entity.obstructedOn(gc, COLLISION_SIDES.BOTTOM, this);
		} else if (entity.vel.y < 0) {
			if (entity.bbox.top < this.bottom) entity.obstructedOn(gc, COLLISION_SIDES.TOP, this);
		}
	}
}

export class WorldCollisionLayer extends Layer {
	private collisionRects: TCellRect[] = [];
	// TODO: temporary solution - grid needs to be passed to others differently (event, task, ?)
	public grid: Grid | null = null;

	constructor(gc: GameContext, parent: Scene) {
		super(gc, parent, "worldcollisions");
		if ("grid" in parent) this.grid = parent.grid as Grid;
	}

	checkX(entity: Entity) {
		if (!entity.vel.x || !this.grid) return;

		const x = entity.vel.x > 0 ? entity.bbox.right : entity.bbox.left;
		const matches = this.grid.searchByRange(x, x, entity.bbox.top, entity.bbox.bottom);
		for (const match of matches) if ("collisionX" in match) (match as ICollisionGridCellX).collisionX(this.gc, entity);
	}

	checkY(entity: Entity) {
		if (!entity.vel.y || !this.grid) return;

		const y = entity.vel.y > 0 ? entity.bbox.bottom : entity.bbox.top;
		const matches = this.grid.searchByRange(entity.bbox.left, entity.bbox.right, y, y);
		for (const match of matches) if ("collisionY" in match) (match as ICollisionGridCellY).collisionY(this.gc, entity);
	}

	/*
	public checkX2(entity: Entity) {
		if (!entity.vel.x || !this.grid) return;

		const dir = entity.vel.x > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT;
		const x = this.grid.toGridX(dir === DIRECTIONS.RIGHT ? entity.right : entity.left);
		const ytop = this.grid.toGridY(entity.top);
		const ybottom = this.grid.toGridY(entity.bottom);

		for (let yIdx = ytop; yIdx < ybottom; yIdx++) {
			const cell = this.grid.get(x, yIdx);
			if (cell) {
				const cellRect: TCellRect = {
					left: cell.r.x,
					top: cell.r.y,
					right: cell.r.x + cell.r.w,
					bottom: cell.r.y + cell.r.h,
					width: cell.r.w,
					height: cell.r.h,
					color: "#FF0000",
				};

				this.collisionRects.push(cellRect);

				const side = dir === DIRECTIONS.RIGHT ? COLLISION_SIDES.RIGHT : COLLISION_SIDES.LEFT;
				entity.obstructedOn(this.gc, side, cellRect);
			} else {
				const [a, b] = this.grid.toCoord(x, yIdx);
				const cellRect: TCellRect = {
					left: a,
					top: b,
					right: a + 16,
					bottom: a + 16,
					width: 16,
					height: 16,
					color: "#0000FF60",
				};
				this.collisionRects.push(cellRect);
			}
		}
	}

	public checkY2(entity: Entity) {
		if (!entity.vel.y || !this.grid) return;

		const dir = entity.vel.y > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP;
		const y = this.grid.toGridY(dir === DIRECTIONS.DOWN ? entity.bottom : entity.top);
		const xleft = this.grid.toGridX(entity.left);
		const xright = this.grid.toGridX(entity.right);

		for (let xIdx = xleft; xIdx < xright; xIdx++) {
			const cell = this.grid.get(xIdx, y);
			if (cell) {
				const cellRect: TCellRect = {
					left: cell.r.x,
					top: cell.r.y,
					right: cell.r.x + cell.r.w,
					bottom: cell.r.y + cell.r.h,
					width: cell.r.w,
					height: cell.r.h,
					color: "#00FF00",
				};

				this.collisionRects.push(cellRect);

				const side = dir === DIRECTIONS.DOWN ? COLLISION_SIDES.BOTTOM : COLLISION_SIDES.TOP;
				entity.obstructedOn(this.gc, side, cellRect);
			}
			{
				const [a, b] = this.grid.toCoord(xIdx, y);
				const cellRect: TCellRect = {
					left: a,
					top: b,
					right: a + 16,
					bottom: a + 16,
					width: 16,
					height: 16,
					color: "#0000FF60",
				};
				this.collisionRects.push(cellRect);
			}
		}
	}
*/
	update(_gc: GameContext, _scene: Scene) {}

	render(gc: GameContext) {
		const ctx = gc.viewport.ctx;
		for (const rect of this.collisionRects) {
			if (rect.isFrame) {
				ctx.strokeStyle = rect.color;
				ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
			} else {
				ctx.fillStyle = rect.color;
				ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
			}
		}
		this.collisionRects = [];
	}
}
