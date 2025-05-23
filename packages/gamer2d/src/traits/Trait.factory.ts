import type { TTraitDefinition, TraitConstructor } from "../game/types/GameOptions";
import type { Trait } from "./Trait";
import { FadeTrait } from "./fade.trait";
import { KillIfOffscreenTrait } from "./killOffscreen.trait";
import { KillableTrait } from "./killable.trait";
import { MouseXTrait } from "./mouseX.trait";
import { MouseXYTrait } from "./mouseXY.trait";
import { OffscreenTrait } from "./offscreen.trait";
import TrapTrait from "./trap.trait";
import { XDragTrait } from "./xdrag.trait";

const traitClasses = {
	MouseXTrait: MouseXTrait,
	MouseXYTrait: MouseXYTrait,
	FadeTrait: FadeTrait,
	XDragTrait: XDragTrait,
	OffscreenTrait: OffscreenTrait,
	KillIfOffscreenTrait: KillIfOffscreenTrait,
	KillableTrait: KillableTrait,
	TrapTrait: TrapTrait,
};

const traitNames = {
	mousex: "MouseXTrait",
	mousexy: "MouseXYTrait",
	fade: "FadeTrait",
	xdrag: "XDragTrait",
	offscreen: "OffscreenTrait",
	killifoffscreen: "KillIfOffscreenTrait",
	killable: "KillableTrait",
	trap: "TrapTrait",
};

export function setupTraits(traitsDefinitions: TTraitDefinition[]) {
	for (const def of traitsDefinitions) setupTrait(def.name, def.classType);
}

export function setupTrait(className: string, classType: TraitConstructor) {
	// const className = getClassName(classType);
	if (traitClasses[className]) return;
	traitClasses[className] = classType;
}

export function getTraitClassname(name: string) {
	let className = traitNames[name.toLowerCase()];
	if (!className) className = name;
	return className;
}

export function createTraitByName(className: string, ...args: unknown[]): Trait {
	// const className = getTraitClassname(name);
	if (!traitClasses[className]) {
		throw new TypeError(`Unknown Trait Type ${className}`);
	}
	return new traitClasses[className](...args);
}
