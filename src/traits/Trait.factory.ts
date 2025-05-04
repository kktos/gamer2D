import type { TraitConstructor } from "../game/types/GameOptions";
import { getClassName } from "../utils/object.util";
import type { Trait } from "./Trait";
import { FadeTrait } from "./fade.trait";
import { KillIfOffscreenTrait } from "./killOffscreen.trait";
import { KillableTrait } from "./killable.trait";
import { MouseXTrait } from "./mouseX.trait";
import { MouseXYTrait } from "./mouseXY.trait";
import { OffscreenTrait } from "./offscreen.trait";
import { XDragTrait } from "./xdrag.trait";

const traitClasses = {
	MouseXTrait,
	MouseXYTrait,
	FadeTrait,
	XDragTrait,
	OffscreenTrait,
	KillIfOffscreenTrait,
	KillableTrait,
};

export function setupTraits(traitsDefinitions: TraitConstructor[]) {
	for (const def of traitsDefinitions) setupTrait(def);
}

export function setupTrait(def: TraitConstructor) {
	const className = getClassName(def);
	if (traitClasses[className]) return;
	traitClasses[className] = def;
}

export function createTrait(className: string, ...args: unknown[]): Trait {
	if (!traitClasses[className]) {
		throw new TypeError(`Unknown Trait Type ${className}`);
	}
	return new traitClasses[className](...args);
}

// export function createTraitByName(resourceManager: ResourceManager, name: string, ...args: unknown[]): Trait {
// 	const className = traitNames[name];
// 	if (!className) {
// 		throw new TypeError(`Unknown Trait Type ${name}`);
// 	}
// 	return new className(resourceManager, ...args);
// }
