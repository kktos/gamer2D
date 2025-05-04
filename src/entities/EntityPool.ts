import type ResourceManager from "../game/ResourceManager";
import type GameContext from "../game/types/GameContext";
import { Entity } from "./Entity";
import { createEntityByName } from "./Entity.factory";

export class EntityPool extends Entity {
	static POOL_SPAWNED = Symbol.for("POOL_SPAWNED");
	static POOL_RELEASED = Symbol.for("POOL_RELEASED");

	static pools: Record<string, EntityPool> = {};

	readonly pool: Entity[];
	private usedList: boolean[];
	private usedCount: number;

	static create(rm: ResourceManager, id: string | undefined, name: string, size: number, ...args) {
		const poolID = id ?? name;
		if (EntityPool.pools[poolID]) throw new TypeError(`EntityPool already exists with this id ${poolID}`);
		const pool = new EntityPool(rm, size, () => createEntityByName(rm, name, ...args));
		pool.id = poolID;
		EntityPool.pools[poolID] = pool;
		return pool;
	}
	static clear() {
		EntityPool.pools = {};
	}

	constructor(resourceManager: ResourceManager, size: number, createObject) {
		super(resourceManager, 0, 0);

		this.pool = Array.from({ length: size }, createObject);
		this.usedList = Array(size).fill(false);
		this.usedCount = 0;
	}

	get(idxOrId: string | number) {
		if (typeof idxOrId === "number") return this.pool[idxOrId];
		return this.pool.find((entity) => entity.id === idxOrId);
	}

	use() {
		const index = this.usedList.indexOf(false);
		if (index !== -1) {
			this.usedList[index] = true;
			const entity = this.pool[index];
			this.usedCount++;
			this.queue(EntityPool.POOL_SPAWNED, this.id, entity.id, this.usedCount, entity);
			return entity;
		}

		// Optionally create a new object if the pool is empty
		// const newIndex = this.pool.push(this._createObject()) - 1;
		// this.available.push(true);
		// return this.pool[newIndex];
	}

	release(obj?) {
		const index = typeof obj === "undefined" ? this.usedList.lastIndexOf(true) : this.pool.indexOf(obj);
		if (index !== -1 && this.usedList[index]) {
			this.usedList[index] = false;
			this.usedCount--;
			const entity = this.pool[index];
			this.queue(EntityPool.POOL_RELEASED, this.id, entity.id, this.usedCount, entity);
		}
	}

	// TODO: to handle collision with entities in the pool ? any use ?!?
	// public collides(gc: GameContext, target: Entity) {}

	update(gc: GameContext, scene) {
		for (let index = 0; index < this.usedList.length; index++) if (this.usedList[index]) this.pool[index].update(gc, scene);
		this.events.process("*", (...args: unknown[]) => gc.scene?.emit(args[0] as symbol, ...args.slice(1)));
		this.events.clear();
	}

	finalize() {
		for (let index = 0; index < this.usedList.length; index++) if (this.usedList[index]) this.pool[index].finalize();
	}

	render(gc: GameContext) {
		for (let index = 0; index < this.usedList.length; index++) if (this.usedList[index]) this.pool[index].render(gc);
	}
}
