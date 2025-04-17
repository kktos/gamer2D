import type { Entity } from "../entities/Entity";
import type GameContext from "../game/GameContext";
import type { Scene } from "../scene/Scene";
import { Layer } from "./Layer";

export class EntitiesLayer extends Layer {
	static TASK_REMOVE_ENTITY = Symbol.for("removeEntity");
	static TASK_ADD_ENTITY = Symbol.for("addEntity");

	entities: Entity[];

	constructor(gc: GameContext, parent, entities: Entity[] = [], sheet = null) {
		super(gc, parent);

		this.entities = entities;

		this.setTaskHandlers();
	}

	setTaskHandlers() {
		const tasks = this.scene.tasks;

		tasks.onTask(EntitiesLayer.TASK_REMOVE_ENTITY, (entity:Entity) => {
			const idx = this.entities.indexOf(entity);
			if (idx !== -1) this.entities.splice(idx, 1);
		});

		tasks.onTask(EntitiesLayer.TASK_ADD_ENTITY, (entity:Entity) => {
			this.entities.push(entity);
		});
	}

	update(gc: GameContext, scene: Scene) {
		for (const entity of this.entities) entity.update(gc, scene);
		for (const entity of this.entities) entity.finalize();
	}

	render(gc: GameContext) {
		for (const entity of this.entities) entity.render(gc);

		const ctx = gc.viewport.ctx;
		ctx.fillStyle = "#fff";
		ctx.font = "10px";
		ctx.fillText(`${this.entities.length}`, 500, 15);
	}
}
