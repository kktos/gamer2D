import { EntitiesLayer } from "../layers/entities.layer";
import { Trait } from "./Trait";

export default class KillableTrait extends Trait {
	static EVENT_KILLED = Symbol.for("Killed");

	public isDead: boolean;
	public deadTime: number;
	public removeAfter: number;

	constructor(removeAfter = 0) {
		super();

		this.isDead = false;
		this.deadTime = 0;
		this.removeAfter = removeAfter;
	}

	kill() {
		this.isDead = true;
	}

	update({ dt }, entity, scene) {
		if (this.isDead) {
			entity.isSolid = false;

			this.deadTime += dt;
			entity.pause();
			if (this.deadTime > this.removeAfter) {
				// scene.broadcast(KillableTrait.EVENT_KILLED, entity);
				scene.addTask(EntitiesLayer.TASK_REMOVE_ENTITY, entity);
			}
		}
	}
}
