import type { Entity } from "../entities/Entity";
import type { GameContext } from "../game/types/GameContext";
import type { Scene } from "../scene/Scene";
import { Trait } from "./Trait";

export class TrapTrait extends Trait {
	static EVENT_TRAPPED = Symbol.for("TRAPPED");

	private isTriggered: boolean;
	private target: Entity | null;

	constructor(public isArmed = true) {
		super();
		this.isTriggered = false;
		this.target = null;
	}

	collides(_gc: GameContext, _entity: Entity, target: Entity): void {
		if (this.isArmed) {
			this.isArmed = false;
			this.isTriggered = true;
			this.target = target;
		}
	}

	update(_gc: GameContext, entity: Entity, scene: Scene) {
		if (this.isTriggered) {
			scene.emit(TrapTrait.EVENT_TRAPPED, entity.id, this.target);
			this.isTriggered = false;
		}
	}
}
