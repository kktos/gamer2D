import type { Entity } from "../entities/Entity";
import type { EventCallback } from "../events/EventBuffer";
import type GameContext from "../game/types/GameContext";
import type { GridCell } from "../maths/grid.math";
import type { TCollisionSide } from "../maths/math";
import type { Scene } from "../scene/Scene";
import { generateID } from "../utils/id.util";
import { getClassName } from "../utils/object.util";

export interface ITrait {
	on(name: string, callback, count: number): Trait;
	finalize(entity: Entity): void;

	collides?(gc: GameContext, entity: Entity, target: Entity): void;
	update?(gc: GameContext, entity: Entity, scene: Scene): void;
}

export interface ITraitCollides {
	collides(gc: GameContext, entity: Entity, target: Entity): void;
}
export interface ITraitUpdate {
	update(gc: GameContext, entity: Entity, scene: Scene): void;
}
export interface ITraitObstructedOn {
	obstructedOn(gc: GameContext, entity: Entity, side: TCollisionSide, cell: GridCell): void;
}
export class TraitDict extends Map<string, Trait> {
	private traits: Map<string, Trait> = new Map();
	get(name: string) {
		return this.traits.get(name);
	}
	set(name: string, trait: Trait) {
		this.traits.set(name, trait);
		return this;
	}
	has(name: string) {
		return this.traits.has(name);
	}
	delete(name: string) {
		return this.traits.delete(name);
	}
	clear() {
		this.traits.clear();
	}
	[Symbol.iterator]() {
		return this.traits[Symbol.iterator]();
	}
	[Symbol.for("inspect")]() {
		const result: string[] = [];
		for (const [_, trait] of this.traits) result.push(trait[Symbol.for("inspect")]());
		return result;
	}
}
export class Trait {
	public class: string;
	public id: string;

	private listeners: { name: string | symbol; callback: EventCallback; count: number }[];

	constructor() {
		this.class = getClassName(this.constructor);
		this.id = generateID();

		this.listeners = [];
	}

	on(name: string | symbol, callback: EventCallback, count = Number.POSITIVE_INFINITY) {
		this.listeners.push({ name, callback, count });
		return this;
	}

	finalize(entity: Entity) {
		this.listeners = this.listeners.filter((listener) => {
			entity.events.process(listener.name, listener.callback);
			return --listener.count;
		});
	}

	[Symbol.for("inspect")]() {
		return `${this.class}(${this.id})`;
	}
}
