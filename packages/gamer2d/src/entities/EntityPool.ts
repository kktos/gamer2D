import type { ResourceManager } from "../game/ResourceManager";
import type { GameContext } from "../game/types/GameContext";
import { Entity } from "./Entity";
import { createEntityByName } from "./Entity.factory";

export class EntityPool extends Entity {
	static POOL_SPAWNED = Symbol.for("POOL_SPAWNED");
	static POOL_RELEASED = Symbol.for("POOL_RELEASED");

	private pool: Entity[] = [];
	private usedList: boolean[] = [];
	private usedCount = 0;

	constructor(rm: ResourceManager, x: number, y: number) {
		super(rm, x, y);
		this.isSolid = false;
	}

	static create(rm: ResourceManager, id: string | undefined, name: string, size: number, ...args) {
		const poolID = id ?? name;

		const pool = new EntityPool(rm, 0, 0);
		pool.id = poolID;

		const spawnOne = () => createEntityByName(rm, name, ...args);
		pool.fill(size, spawnOne);

		return pool;
	}

	fill(size: number, createObject: () => Entity) {
		this.pool = Array.from({ length: size }, createObject);
		this.usedList = Array(size).fill(false);
	}

	get(idxOrId: string | number) {
		if (typeof idxOrId === "number") return this.pool[idxOrId];
		return this.pool.find((entity) => entity.id === idxOrId);
	}

	use(howMany = 1) {
		const batch: Entity[] = [];
		for (let idx = 0; idx < howMany; idx++) {
			const index = this.usedList.indexOf(false);
			if (index !== -1) {
				this.usedList[index] = true;
				const entity = this.pool[index];
				this.usedCount++;
				this.queue(EntityPool.POOL_SPAWNED, this.id, entity.id, this.usedCount, entity);
				batch.push(entity);
			}
		}
		return batch.length === 1 ? batch[0] : batch;
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
