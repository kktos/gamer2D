import type { Entity } from "../entities/Entity";
import type GameContext from "../game/GameContext";
import type { Scene } from "../scene/Scene";
import LevelScene from "../scene/level.scene";
import { Trait } from "./Trait";

export default class SpawnerTrait extends Trait {
	private entities: Entity[];
	private wannaSpawn: boolean;

	constructor() {
		super();

		this.entities = [];
		this.wannaSpawn = false;
	}

	spawn(entity: Entity) {
		this.entities.push(entity);
		this.wannaSpawn = true;
	}

	update(gc: GameContext, entity: Entity, scene: Scene) {
		if (!this.wannaSpawn || !this.entities.length) return;
		this.wannaSpawn = false;
		// this.entities.forEach(entity => scene.addTask(LevelScene.TASK_ADD_ENTITY, entity));
		for (let idx = 0; idx < this.entities.length; idx++) {
			const entity = this.entities[idx];
			scene.addTask(LevelScene.TASK_ADD_ENTITY, entity);
		}
		this.entities.length = 0;
	}
}
