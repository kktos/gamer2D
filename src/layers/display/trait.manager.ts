import type { Entity } from "../../entities/Entity";
import type { Trait } from "../../traits/Trait";
import { ArgVariable } from "../../types/value.types";
import type { TVars } from "../../utils/vars.utils";

// handling of "traits:[ trait1, trait2, ...]"
export function addTraits(traits: ArgVariable | ArgVariable[], entity: Entity | Entity[], vars: TVars) {
	let traitsArray: ArgVariable[];
	if (traits instanceof ArgVariable) {
		traitsArray = vars.get(traits.value) as unknown as ArgVariable[];
	} else {
		traitsArray = traits;
	}
	for (const traitName of traitsArray) {
		const trait = vars.get(traitName.value) as Trait;
		if (Array.isArray(entity)) {
			for (const e of entity) e.addTrait(trait);
			continue;
		}
		entity.addTrait(trait);
	}
}
