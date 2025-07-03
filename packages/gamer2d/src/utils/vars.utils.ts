import type { Entity } from "../entities/Entity";
import type { Anim } from "../game/Anim";
import type { System } from "../layers/display/views/System.view";
import type { View } from "../layers/display/views/View";
import type { TText } from "../script/compiler/layers/display/layout/text.rules";
import type { Trait } from "../traits/Trait";
import type { TResultValue, TVarSounds } from "../types/engine.types";
import type { ArgVariable } from "../types/value.types";

export type TVarTypes = TResultValue | TVarSounds | Map<string, Entity> | Record<string, unknown> | TText | View | System | Trait | Anim | ArgVariable[];
// export type TVarDict = Map<string, unknown>;

export class TVars {
	constructor(
		private globals: TVarDict,
		private locals: TVarDict = new TVarDict(),
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

	[Symbol.for("inspect")]() {
		return this.locals[Symbol.for("inspect")]();
	}
}

export class TVarDict extends Map<string, unknown> {
	[Symbol.for("inspect")]() {
		const result = document.createElement("ul");
		let html = "";
		for (const [name, varValue] of this.entries()) {
			const value = varValue as Record<string | symbol, unknown>;
			// biome-ignore lint/complexity/noBannedTypes: no other choice here
			const displayValue = value[Symbol.for("inspect")] ? (value[Symbol.for("inspect")] as Function)() : value;
			html += `<li>${name}: ${displayValue}</li>`;
		}
		result.innerHTML = html;
		return result;
	}
}
