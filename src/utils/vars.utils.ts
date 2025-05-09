import type { Entity } from "../entities/Entity";
import type Anim from "../game/Anim";
import type { System } from "../layers/display/views/System.view";
import type { View } from "../layers/display/views/View";
import type { Trait } from "../traits/Trait";
import type { TResultValue, TVarSounds } from "../types/engine.types";
import type { ArgVariable } from "../types/value.types";

export type TVarTypes = TResultValue | TVarSounds | Map<string, Entity> | Record<string, unknown> | View | System | Trait | Anim | ArgVariable[];
// export type TVarDict = Map<string, TVarTypes>;
export type TVarDict = Map<string, unknown>;

export class TVars {
	constructor(
		private globals: TVarDict,
		private locals: TVarDict = new Map(),
	) {}

	public get<T extends TVarTypes>(key: string): T {
		if (this.globals.has(key)) return this.globals.get(key) as T;
		return this.locals.get(key) as T;
	}

	public set(key: string, value: unknown): void {
		if (this.globals.has(key)) this.globals.set(key, value);
		else this.locals.set(key, value);
	}

	public has(key: string): boolean {
		return this.globals.has(key) || this.locals.has(key);
	}

	// public delete(key: string): boolean {
	// 	return this.locals.delete(key);
	// }

	// public clear(): void {
	// 	this.locals.clear();
	// }

	// public get size(): number {
	// 	return this.locals.size;
	// }

	// public get keys(): IterableIterator<string> {
	// 	return this.locals.keys();
	// }

	// public get values(): IterableIterator<TVarTypes> {
	// 	return this.locals.values();
	// }

	// public get entries(): IterableIterator<[string, TVarTypes]> {
	// 	return this.locals.entries();
	// }
}
