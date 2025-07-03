import type { Entity } from "../entities/Entity";
import { EntitiesLayer } from "../layers/entities.layer";
import type { Scene } from "../scenes/Scene";
import { Trait } from "./Trait";
import { setupTrait } from "./Trait.factory";

export class KillableTrait extends Trait {
	static EVENT_KILLED = Symbol.for("KILLED");

	public isDead: boolean;
	public deadTime: number;
	public removeAfter: number;
	private isEmitted: boolean;

	constructor(removeAfter = 0) {
		super();

		this.isDead = false;
		this.isEmitted = false;
		this.deadTime = 0;
		this.removeAfter = removeAfter;
	}

	kill() {
		this.isDead = true;
	}

	bury() {
		if (this.isDead) this.removeAfter = 0;
	}

	update({ dt }, entity: Entity, scene: Scene) {
		if (this.isDead) {
			entity.isSolid = false;
			// no entity collision
			entity.isGhost = true;
			// no movement
			entity.isFixed = true;

			if (!this.isEmitted) {
				this.isEmitted = true;
				scene.emit(KillableTrait.EVENT_KILLED, entity);
				// scene.broadcast(KillableTrait.EVENT_KILLED, entity);
			}

			this.deadTime += dt;
			entity.pause();
			if (this.deadTime > this.removeAfter) scene.addTask(EntitiesLayer.TASK_REMOVE_ENTITY, entity);
		}
	}
}
setupTrait({ name: "KillableTrait", alias: "killable", classType: KillableTrait });
