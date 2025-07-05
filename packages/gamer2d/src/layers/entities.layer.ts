import type { Entity } from "../entities/Entity";
import type { GameContext } from "../game/types/GameContext";
import type { Scene } from "../scenes/Scene";
import type { TNeatCommand } from "../script/compiler2/types/commands.type";
import { runCommands } from "../script/engine2/exec";
import type { ExecutionContext } from "../script/engine2/exec.type";
import { functions } from "../script/engine2/functions/functionDict.utils";
import type { Grid } from "../utils/maths/grid.math";
import { createVariableStore } from "../utils/vars.store";
import { Layer } from "./Layer.class";

export class EntitiesLayer extends Layer {
	static TASK_REMOVE_ENTITY = Symbol.for("removeEntity");
	static TASK_ADD_ENTITY = Symbol.for("addEntity");
	static TASK_ADD_BEFORE_ENTITY = Symbol.for("addBeforeEntity");

	private selectedEntity: Entity | undefined;
	public entities: Entity[] = [];
	public wannaShowCount: boolean;
	public wannaShowFrame: boolean;
	public frameColor: string;

	constructor(gc: GameContext, parent: Scene, sheet, _grid?: Grid) {
		super(gc, parent, "entities");

		const settings = this.prepareRendering(gc, sheet.data);

		this.wannaShowCount = settings?.show_entities_count === true;
		this.wannaShowFrame = !!settings?.show_entity_frame;
		this.frameColor = (settings?.entity_frame_color as string) ?? "red";

		this.setTaskHandlers();
	}

	public clear() {
		this.entities.length = 0;
	}

	public get(idxOrId: string | number) {
		if (typeof idxOrId === "number") return this.entities[idxOrId];
		return this.entities.find((entity) => entity.id === idxOrId);
	}

	public selectEntity(idxOrId: string | number) {
		this.selectedEntity = this.get(idxOrId);
		return this.selectedEntity;
	}

	private prepareRendering(gc: GameContext, statements: TNeatCommand[]) {
		const context: ExecutionContext = {
			variables: createVariableStore(),
			functions: functions,
			gc,
			currentScene: this.scene,
		};

		const results = runCommands(statements, context) as Record<string, unknown>[];

		const settingBlocks = results.filter((result) => "type" in result && result.type === "SETTINGS");
		let settings: Record<string, unknown> = {};
		for (const block of settingBlocks) settings = { ...settings, ...(block.value as Record<string, unknown>) };
		return settings;
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
