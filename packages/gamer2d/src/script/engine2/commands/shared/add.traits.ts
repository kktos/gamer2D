import type { Entity } from "../../../../entities";
import type { Trait } from "../../../../traits";
import type { TNeatExpression } from "../../../compiler2/types/expression.type";
import type { ExecutionContext } from "../../exec.type";
import { evalExpression } from "../../expr.eval";

export function addTraits(expr: TNeatExpression, entity: Entity, context: ExecutionContext) {
	let traits = evalExpression(expr, context);
	if (!Array.isArray(traits)) traits = [traits];

	for (const trait of traits) {
		// if (typeof trait !== "string") throw new Error(`Animation ${trait} not found`);
		// const animDef = context.variables.get(trait) as TAnimationPathPathDTO;
		// if (!animDef) throw new Error(`Animation ${trait} not found`);

		// const animTrait = new AnimationPathTrait(context, animDef);
		entity.addTrait(trait as unknown as Trait);
	}
}
