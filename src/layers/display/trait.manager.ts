import type { Entity } from "../../entities/Entity";
import { evalValue } from "../../script/engine/eval.script";
import type { Trait } from "../../traits/Trait";
import { ArgVariable, ValueTrait } from "../../types/value.types";
import type { TVars } from "../../utils/vars.utils";

// handling of "traits:[ trait1, trait2, ...]"
export function addTraits(traits: ArgVariable | (ArgVariable | ValueTrait)[], entity: Entity | Entity[], vars: TVars) {
	let traitsArray: (ArgVariable | ValueTrait)[];

	traitsArray = traits instanceof ArgVariable ? vars.get<ArgVariable[]>(traits.value) : traits;

	let trait: Trait | undefined;
	for (const traitName of traitsArray) {
		if (traitName instanceof ArgVariable) trait = vars.get<Trait>(traitName.value);
		else if (traitName instanceof ValueTrait) trait = evalValue({ vars }, traitName);

		if (!trait) {
			console.error("addTraits", traitName);
			throw new TypeError(`Unknown trait "${traitName}"`);
		}

		if (Array.isArray(entity)) {
			for (const e of entity) e.addTrait(trait);
			continue;
		}
		entity.addTrait(trait);
	}
}
