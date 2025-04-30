import type { Entity } from "../../entities/Entity";
import type { TSprite } from "../../script/compiler/layers/display/layout/sprite.rules";
import type { TText } from "../../script/compiler/layers/display/layout/text.rules";
import type { Trait } from "../../traits/Trait";
import { ArgVariable } from "../../types/value.types";
import type { TVars } from "../../utils/vars.utils";

// handling of "traits:[ trait1, trait2, ...]"
export function setupTraits(op: (TText | TSprite) & { entity?: Entity }, entity: Entity, vars: TVars) {
	if (!op.traits) return;

	let traitsArray: ArgVariable[];
	if (op.traits instanceof ArgVariable) {
		traitsArray = vars.get(op.traits.value) as unknown as ArgVariable[];
	} else {
		traitsArray = op.traits;
	}
	for (const traitName of traitsArray) {
		const trait = vars.get(traitName.value) as Trait;
		entity.addTrait(trait);
	}
}
