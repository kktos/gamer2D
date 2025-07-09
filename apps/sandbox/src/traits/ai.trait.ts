import type { Entity } from "gamer2d/entities/Entity";
import type { GameContext } from "gamer2d/game/index";
import type { EntitiesLayer } from "gamer2d/layers/entities.layer";
import type { WorldCollisionLayer } from "gamer2d/layers/worldcollision.layer";
import type { Scene } from "gamer2d/scenes/Scene";
import { Trait } from "gamer2d/traits/index";
import { BBox } from "gamer2d/utils/maths/BBox.class";
import type { Grid } from "gamer2d/utils/maths/grid.math";

export class AITrait extends Trait {
	private players: Entity[];
	private grid: Grid | undefined;

	constructor() {
		super();
		this.players = [];
	}

	update(_gc: GameContext, entity: Entity, scene: Scene) {
		//
		if (!this.grid)
			scene.useLayer("worldcollision", (layer: WorldCollisionLayer) => {
				if (layer.grid) this.grid = layer.grid;
			});

		scene.useLayer("entities", (layer: EntitiesLayer) => {
			this.players = layer.findByTrait("PlayerTrait");
		});

		if (this.players.length && this.grid) {
			const player = this.players[0];
			const playerY = this.grid.toGridY(player.bbox.top);
			const monsterY = this.grid.toGridY(entity.bbox.top);

			if (playerY === monsterY) {
				if (!this.hasLineOfSight(this.grid, entity.bbox, player.bbox)) console.log("INVISIBLE");
			}
		}
	}

	private hasLineOfSight(grid: Grid, enemyBBox: BBox, playerBBox: BBox): boolean {
		const unionBBox = BBox.copy(enemyBBox);
		unionBBox.unionWith(playerBBox);

		// Convert to grid coordinates
		const startGridX = grid.toGridX(unionBBox.left);
		const endGridX = grid.toGridX(unionBBox.right);
		const topGridY = grid.toGridY(unionBBox.top);
		const bottomGridY = grid.toGridY(unionBBox.bottom);

		for (let x = startGridX; x <= endGridX; x++) {
			for (let y = topGridY; y <= bottomGridY; y++) {
				const cell = grid.get(x, y);
				if (cell) return false;
			}
		}
		return true;
	}
}
