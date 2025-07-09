import type { Entity } from "../../../../entities";
import { AnimationPathTrait, type TAnimationPathPathDTO } from "../../../../traits/animation_path.trait";
import type { TNeatExpression } from "../../../compiler2/types/expression.type";
import type { ExecutionContext } from "../../exec.context";
import { evalExpression } from "../../expr.eval";

export function addAnims(expr: TNeatExpression, entity: Entity, context: ExecutionContext) {
	let anims = evalExpression(expr, context);
	if (!Array.isArray(anims)) anims = [anims];

	for (const anim of anims) {
		if (typeof anim !== "string") throw new Error(`Animation ${anim} not found`);
		const animDef = context.variables.get(anim) as TAnimationPathPathDTO;
		if (!animDef) throw new Error(`Animation ${anim} not found`);

		const animTrait = new AnimationPathTrait(context, animDef);
		entity.addTrait(animTrait);
	}
}
