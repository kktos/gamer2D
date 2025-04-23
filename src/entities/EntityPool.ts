import type GameContext from "../game/GameContext";
import type ResourceManager from "../game/ResourceManager";
import { createEntity } from "./Entity.factory";

export class EntityPool {
	static pools = {};

	private pool: EntityPool[];
	private available: boolean[];

	static create(resourceManager: ResourceManager, name: string, size: number, ...args) {
		const pool = new EntityPool(size, () => createEntity(resourceManager, name, ...args));
		EntityPool.pools[name] = pool;
		return pool;
	}

	constructor(size: number, createObject) {
		this.pool = Array.from({ length: size }, createObject);
		this.available = Array(size).fill(true);
	}

	get() {
		const index = this.available.indexOf(true);
		if (index !== -1) {
			this.available[index] = false;
			return this.pool[index];
		}

		// Optionally create a new object if the pool is empty
		// const newIndex = this.pool.push(this._createObject()) - 1;
		// this.available.push(true);
		// return this.pool[newIndex];
	}

	release(obj) {
		const index = this.pool.indexOf(obj);
		if (index !== -1 && !this.available[index]) {
			this.available[index] = true;
		}
	}

	update(gc: GameContext, scene) {
		for (let index = 0; index < this.available.length; index++) {
			if (!this.available[index]) this.pool[index].update(gc, scene);
		}
	}

	finalize() {
		for (let index = 0; index < this.available.length; index++) {
			if (!this.available[index]) this.pool[index].finalize();
		}
	}

	render(gc: GameContext) {
		for (let index = 0; index < this.available.length; index++) {
			if (!this.available[index]) this.pool[index].render(gc);
		}
	}
}
