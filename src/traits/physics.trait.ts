import type { Entity } from "../entities/Entity";
import ENV from "../env";
import type GameContext from "../game/GameContext";
import { COLLISION, intersectRect } from "../maths/math";
import type LevelScene from "../scene/level.scene";
import { Trait } from "./Trait";

type CellRect = {
	left: number;
	top: number;
	right: number;
	bottom: number;
	with: number;
	height: number;
};

export class PhysicsTrait extends Trait {
	private collisionRects: CellRect[];

	constructor() {
		super();
		this.collisionRects = [];
	}

	update(gc: GameContext, entity: Entity, scene: LevelScene) {
		entity.vel.y += (scene.gravity ?? 50) * entity.mass * gc.dt;

		entity.left += entity.vel.x * gc.dt;
		// level.tileCollider.checkX(entity, gameContext, level);

		entity.top += entity.vel.y * gc.dt;
		// level.tileCollider.checkY(entity, gameContext, level);
		//this.checkY(gc, entity, scene);
	}

	/*
	checkY(gc: GameContext, entity: Entity, scene: LevelScene) {
		if (!entity.vel.y || !scene.grid) return;

		const { x, y } = scene.grid.toGrid(entity.left, entity.top);
		const { x: x2, y: y2 } = scene.grid.toGrid(entity.left + entity.size.x, entity.top + entity.size.y);

		for (let yIdx = y; yIdx <= y2; yIdx++) {
			for (let xIdx = x; xIdx <= x2; xIdx++) {
				const cell = scene.grid.get(xIdx, yIdx);
				if (cell) {
					return entity.vel.y > 0 ? entity.collides(gc, COLLISION.BOTTOM) : entity.collides(gc, COLLISION.TOP);
				}
			}
		}
	}

	checkX(gc: GameContext, entity: Entity, scene: LevelScene) {
		if (!entity.vel.y || !scene.grid) return;

		const x = Math.floor((entity.left - ENV.LEVEL_GRID.X) / scene.grid.cellWidth);
		const y = Math.floor((entity.top - ENV.LEVEL_GRID.Y) / scene.grid.cellHeight);
		const x2 = Math.floor((entity.left - ENV.LEVEL_GRID.X + entity.size.x) / scene.grid.cellWidth);
		const y2 = Math.floor((entity.top - ENV.LEVEL_GRID.Y + entity.size.y) / scene.grid.cellHeight);

		for (let xIdx = x; xIdx <= x2; xIdx++) {
			for (let yIdx = y; yIdx <= y2; yIdx++) {
				const cell = scene.grid.get(xIdx, yIdx);
				if (cell) {
					const cellRect: CellRect = {
						left: cell.r.x,
						top: cell.r.y,
						right: cell.r.x + cell.r.w,
						bottom: cell.r.y + cell.r.h,
						with: cell.r.w,
						height: cell.r.h,
					};

					// collisionRects.push(cellRect);

					// ctx.fillStyle = "green";
					// ctx.fillRect(cellRect.left, cellRect.top, 16, 16);

					// if(intersectRect(entityRect, cellRect))
					// 	entity.collides(gc, COLLISION.BOTTOM);
				}
			}
		}
	}
	__checkY(gc: GameContext, entity: Entity, scene: LevelScene) {
		if (!entity.vel.y || !scene.grid) return;

		this.collisionRects = [];

		// 34 x 32

		const xCount = Math.floor(entity.size.x / scene.grid.cellWidth) + 1;
		const yCount = Math.floor(entity.size.y / scene.grid.cellHeight) + 1;

		const x = 2 * Math.floor((entity.left - 20) / scene.grid.cellWidth) - 1;
		const y = Math.floor(entity.top / scene.grid.cellHeight) - 1;

		const entityRect = {
			left: entity.left,
			top: entity.top,
			right: entity.left + entity.size.x,
			bottom: entity.top + entity.size.y,
		};

		// console.log("---", entityRect);

		for (let xIdx = 0; xIdx < xCount; xIdx++) {
			for (let yIdx = 0; yIdx < yCount; yIdx++) {
				const cell = scene.grid.get(x + xIdx, y + yIdx);
				if (cell) {
					const cellRect: CellRect = {
						left: cell.r.x,
						top: cell.r.y,
						right: cell.r.x + cell.r.w,
						bottom: cell.r.y + cell.r.h,
						with: cell.r.w,
						height: cell.r.h,
					};

					this.collisionRects.push(cellRect);
					// console.log(xIdx, yIdx, cellRect);

					if (intersectRect(entityRect, cellRect)) entity.collides(gc, COLLISION.BOTTOM);
				}
			}
		}

		// const cell= scene.grid.get(x,y);
		// if(cell) {
		//     const cellRect= {
		// 		left: cell.r.x,
		// 		top: cell.r.y,
		// 		right: cell.r.x + cell.r.w,
		// 		bottom: cell.r.y + cell.r.h
		// 	};
		// 	if(intersectRect(entity, cellRect))
		// 		entity.collides(gc, COLLISION.BOTTOM);
		// }

		// scene.grid.forEach((cell, _) => {

		//     const cellRect= {
		// 		left: cell.r.x,
		// 		top: cell.r.y,
		// 		right: cell.r.x + cell.r.w,
		// 		bottom: cell.r.y + cell.r.h
		// 	};

		// 	if(intersectRect(entity, cellRect))
		// 		entity.collides(gc, COLLISION.BOTTOM);

		// });
	}

*/
}
