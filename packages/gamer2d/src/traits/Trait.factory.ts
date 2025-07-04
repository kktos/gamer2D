import type { TTraitDefinition } from "../game/types/GameOptions";
import { addFunction } from "../script/engine2/functions/functionDict.utils";
import type { Trait } from "./Trait";

const traitClassMap = {};
const traitNames = {};

export function setupTraits(traitsDefinitions: TTraitDefinition[]) {
	for (const def of traitsDefinitions) setupTrait({ name: def.name, classType: def.classType });
}

export function setupTrait(traitDef: TTraitDefinition) {
	const { name: className, classType, alias } = traitDef;

	const functions = [className];

	if (traitClassMap[className]) return;
	if (alias) {
		traitNames[alias] = className;
		functions.push(alias);
	}
	traitClassMap[className] = classType;

	addFunction(functions, (context, ...args: unknown[]) => new classType(...args));
}

export function getTraitClassname(name: string) {
	let className = traitNames[name.toLowerCase()];
	if (!className) className = name;
	return className;
}

export function createTraitByName(className: string, ...args: unknown[]): Trait {
	// const className = getTraitClassname(name);
	if (!traitClassMap[className]) {
		throw new TypeError(`Unknown Trait Type ${className}`);
	}
	return new traitClassMap[className](...args);
}
