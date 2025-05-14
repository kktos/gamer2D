import type { Entity } from "../../entities/Entity";
import type { TSprite } from "../../script/compiler/layers/display/layout/sprite.rules";
import type { TText } from "../../script/compiler/layers/display/layout/text.rules";
import { isStringInterpolable } from "../../script/engine/eval.script";
import { VariableTrait } from "../../traits/variable.trait";
import { ArgExpression, ArgVariable } from "../../types/value.types";
import type { TVars } from "../../utils/vars.utils";

const varProps = [
	{ propName: "pos", alias: ["left", "top"] },
	{ propName: "width", alias: "width" },
	{ propName: "height", alias: "height" },
	{ propName: "text", alias: "text" },
	{ propName: "dir", alias: "dir" },
];

// handling with VariableTrait of some props with variable value
export function setupVariableProps(op: (TText | TSprite) & { entity?: Entity }, entity: Entity, vars: TVars) {
	const addTrait = (prop, alias) => {
		if (typeof prop === "number") return;
		if (typeof prop === "string") {
			if ("text" in op && isStringInterpolable(prop)) {
				entity.addTrait(new VariableTrait({ vars, propName: alias, text: op.text }));
			}
			return;
		}
		if (prop instanceof ArgVariable) {
			entity.addTrait(new VariableTrait({ vars, propName: alias, varName: prop.value }));
			return;
		}
		// if (prop instanceof ArgExpression) entity.addTrait(new VariableTrait({ vars, propName: alias, text: op.text }));
		if (prop instanceof ArgExpression) entity.addTrait(new VariableTrait({ vars, propName: alias, text: prop }));
	};
	for (const { propName, alias } of varProps) {
		if (!(propName in op)) continue;
		if (Array.isArray(op[propName])) {
			for (let idx = 0; idx < op[propName].length; idx++) {
				addTrait(op[propName][idx], alias[idx]);
			}
			continue;
		}
		addTrait(op[propName], alias);
	}
}
