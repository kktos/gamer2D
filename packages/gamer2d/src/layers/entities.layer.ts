import type { Entity } from "../entities/Entity";
import { GLOBAL_VARIABLES } from "../game/globals";
import type { GameContext } from "../game/types/GameContext";
import type { Grid } from "../maths/grid.math";
import type { Scene } from "../scene/Scene";
import type { TLayerEntitiesSheet, TLayerEntitiesSprite, TLayerEntitiesStatement } from "../script/compiler/layers/entities/entities.rules";
import { OP_TYPES } from "../types/operation.types";
import { ArgColor } from "../types/value.types";
import { createLevelEntities } from "../utils/createLevelEntities.utils";
import { TVars } from "../utils/vars.utils";
import { Layer } from "./Layer";
import { repeat } from "./display/repeat.manager";

export class EntitiesLayer extends Layer {
	static TASK_REMOVE_ENTITY = Symbol.for("removeEntity");
	static TASK_ADD_ENTITY = Symbol.for("addEntity");
	static TASK_ADD_BEFORE_ENTITY = Symbol.for("addBeforeEntity");

	private selectedEntity: Entity | undefined;
	public entities: Entity[] = [];
	private sprites: TLayerEntitiesSprite[] | undefined;
	public wannaShowCount: boolean;
	public wannaShowFrame: boolean;
	public frameColor: string;

	constructor(gc: GameContext, parent: Scene, sheet: TLayerEntitiesSheet, grid?: Grid) {
		super(gc, parent, "entities");

		if (sheet.statements) this.sprites = this.prepareRendering(sheet.statements);

		if (grid) this.spawnEntities(grid);

		this.wannaShowCount = sheet.settings?.show_entities_count === true;
		this.wannaShowFrame = !!sheet.settings?.show_entity_frame;
		this.frameColor = sheet.settings?.show_entity_frame instanceof ArgColor ? sheet.settings?.show_entity_frame.value : "red";

		this.setTaskHandlers();
	}

	public clear() {
		this.entities.length = 0;
	}

	public get(idxOrId: string | number) {
		if (typeof idxOrId === "number") return this.entities[idxOrId];
		return this.entities.find((entity) => entity.id === idxOrId);
	}

	public spawnEntities(grid: Grid) {
		if (!this.sprites) return;
		this.entities = createLevelEntities(this.gc.resourceManager, grid, this.sprites);
		return this.entities.length;
	}

	public selectEntity(idxOrId: string | number) {
		this.selectedEntity = this.get(idxOrId);
		return this.selectedEntity;
	}

	private prepareRendering(statements: TLayerEntitiesStatement[]) {
		const repeatList = statements.filter((statement) => statement.type === OP_TYPES.REPEAT);
		if (!repeatList.length) return statements as unknown as TLayerEntitiesSprite[];

		const vars = new TVars(GLOBAL_VARIABLES, GLOBAL_VARIABLES);
		const sprites: TLayerEntitiesSprite[] = [];
		for (const repeatItem of repeatList) repeat(repeatItem, (item) => sprites.push(item as unknown as TLayerEntitiesSprite), vars);

		const spriteList = statements.filter((statement) => statement.type === OP_TYPES.SPRITE);
		return spriteList.concat(sprites);
	}

	public setTaskHandlers() {
		const tasks = this.scene.tasks;

		tasks.onTask(EntitiesLayer.TASK_REMOVE_ENTITY, (entity: Entity) => {
			const idx = this.entities.indexOf(entity);
			if (idx !== -1) this.entities.splice(idx, 1);
		});

		tasks.onTask(EntitiesLayer.TASK_ADD_ENTITY, (entity: Entity) => this.entities.push(entity));

		tasks.onTask(EntitiesLayer.TASK_ADD_BEFORE_ENTITY, (beforeEntity: Entity, entity: Entity) => {
			const idx = this.entities.indexOf(beforeEntity);
			if (idx !== -1) this.entities.splice(idx, 0, entity);
		});
	}

	// TODO: check Matter-js collisions : https://github.com/liabru/matter-js/blob/master/src/collision/Collision.js
	private handleCollisions(gc: GameContext) {
		for (let targetIdx = 0; targetIdx < this.entities.length; targetIdx++) {
			const target = this.entities[targetIdx];
			for (let idx = targetIdx + 1; idx < this.entities.length; idx++)
				if (target.bbox.intersects(this.entities[idx].bbox)) target.collides(gc, this.entities[idx]);
		}
	}

	public update(gc: GameContext, scene: Scene) {
		for (const entity of this.entities) entity.update(gc, scene);

		this.handleCollisions(gc);

		for (const entity of this.entities) entity.finalize();

		if (this.debugCallback) this.debugCallback();
	}

	public render(gc: GameContext) {
		for (const entity of this.entities) entity.render(gc);

		if (this.wannaShowCount) {
			const ctx = gc.viewport.ctx;
			ctx.fillStyle = "#fff";
			ctx.font = "10px";
			ctx.textAlign = "right";
			ctx.fillText(`${this.entities.length}`, gc.viewport.width - 5, 12);
		}

		if (this.wannaShowFrame) {
			const ctx = gc.viewport.ctx;
			for (const entity of this.entities) {
				ctx.strokeStyle = this.frameColor;
				ctx.strokeRect(entity.bbox.left, entity.bbox.top, entity.bbox.width, entity.bbox.height);
			}
		}

		if (this.selectedEntity) {
			const ctx = gc.viewport.ctx;
			ctx.strokeStyle = "red";
			ctx.strokeRect(this.selectedEntity.bbox.left, this.selectedEntity.bbox.top, this.selectedEntity.bbox.width, this.selectedEntity.bbox.height);
		}
	}
}
