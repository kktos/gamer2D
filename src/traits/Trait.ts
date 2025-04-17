import type { Entity } from "../entities/Entity";
import type { EventCallback } from "../events/EventBuffer";
import type GameContext from "../game/GameContext";
import type { COLLISION } from "../maths/math";
import type { Scene } from "../scene/Scene";
import { generateID } from "../utils/id.util";

export interface ITrait {
	on(name: string, callback, count: number): Trait;
	finalize(entity: Entity): void;

	collides?(gc: GameContext, side: typeof COLLISION, entity: Entity, target: Entity): void;
	update?(gc: GameContext, entity: Entity, scene: Scene): void;
}

export class Trait implements ITrait {
	class: string;
	id: string;
	listeners: { name: string; callback: EventCallback; count: number }[];

	constructor() {
		const m = String(this.constructor).match(/class ([a-zA-Z0-9_]+)/);
		this.class = m?.[1] ?? "Trait??";
		this.id = generateID();

		this.listeners = [];
	}

	on(name: string, callback: EventCallback, count = Number.POSITIVE_INFINITY) {
		this.listeners.push({ name, callback, count });
		return this;
	}

	finalize(entity: Entity) {
		this.listeners = this.listeners.filter((listener) => {
			entity.events.process(listener.name, listener.callback);
			return --listener.count;
		});
	}

	// collides() {}
	// update() {}
}
