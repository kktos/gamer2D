import type { traitDefinition } from "../game/Game";
import type { Trait } from "./Trait";
import { FadeTrait } from "./fade.trait";
import { MouseXTrait } from "./mouseX.trait";

const traitClasses = {
	MouseXTrait,
	FadeTrait,
};

// const traitNames = {};

export function setupTraits(traitsDefinitions: traitDefinition[]) {
	for (const def of traitsDefinitions) {
		const { className, classType } = def;
		if (traitClasses[className]) continue;
		// traitNames[name] = className;
		traitClasses[className] = classType;
	}
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
