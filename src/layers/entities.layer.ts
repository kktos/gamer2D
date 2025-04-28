import type { Entity } from "../entities/Entity";
import type GameContext from "../game/types/GameContext";
import type { Grid } from "../maths/grid.math";
import { intersectRect } from "../maths/math";
import type { Scene } from "../scene/Scene";
import type { TLayerDisplaySheet } from "../script/compiler/layers/display/display.rules";
import type { TSceneLevelSheet } from "../script/compiler/layers/level/level.rules";
import { createLevelEntities } from "../utils/createLevelEntities.utils";
import { Layer } from "./Layer";

export class EntitiesLayer extends Layer {
	static TASK_REMOVE_ENTITY = Symbol.for("removeEntity");
	static TASK_ADD_ENTITY = Symbol.for("addEntity");

	private entities: Entity[];
	private wannaShowCount: boolean;

	constructor(gc: GameContext, parent: Scene, sheet: TSceneLevelSheet | TLayerDisplaySheet, grid?: Grid) {
		super(gc, parent);

		this.entities = grid ? createLevelEntities(gc.resourceManager, grid, (sheet as TSceneLevelSheet).sprites) : [];

		this.wannaShowCount = sheet.settings?.show_entities_count === true;

		this.setTaskHandlers();
	}

	public setTaskHandlers() {
		const tasks = this.scene.tasks;

		tasks.onTask(EntitiesLayer.TASK_REMOVE_ENTITY, (entity: Entity) => {
			const idx = this.entities.indexOf(entity);
			if (idx !== -1) this.entities.splice(idx, 1);
		});

		tasks.onTask(EntitiesLayer.TASK_ADD_ENTITY, (entity: Entity) => {
			this.entities.push(entity);
		});
	}

	private handleCollisions(gc: GameContext) {
		for (let targetIdx = 0; targetIdx < this.entities.length; targetIdx++) {
			const target = this.entities[targetIdx];
			for (let idx = targetIdx + 1; idx < this.entities.length; idx++) {
				if (intersectRect(target, this.entities[idx])) target.collides(gc, this.entities[idx]);
			}
		}
	}

	public update(gc: GameContext, scene: Scene) {
		for (const entity of this.entities) entity.update(gc, scene);

		this.handleCollisions(gc);

		for (const entity of this.entities) entity.finalize();
	}

	public render(gc: GameContext) {
		for (const entity of this.entities) entity.render(gc);

		if (this.wannaShowCount) {
			const ctx = gc.viewport.ctx;
			ctx.fillStyle = "#fff";
			ctx.font = "10px";
			ctx.fillText(`${this.entities.length}`, 500, 15);
		}
	}
}
