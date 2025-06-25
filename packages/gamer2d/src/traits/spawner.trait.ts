import type { Entity } from "../entities/Entity";
import type { GameContext } from "../game/types/GameContext";
import { EntitiesLayer } from "../layers/entities.layer";
import type { Scene } from "../scene/Scene";
import { Trait } from "./Trait";

export class SpawnerTrait extends Trait {
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

	update(_gc: GameContext, _entity: Entity, scene: Scene) {
		if (!this.wannaSpawn || !this.entities.length) return;
		this.wannaSpawn = false;
		for (let idx = 0; idx < this.entities.length; idx++) {
			const entity = this.entities[idx];
			scene.addTask(EntitiesLayer.TASK_ADD_ENTITY, entity);
		}
		this.entities.length = 0;
	}
}
