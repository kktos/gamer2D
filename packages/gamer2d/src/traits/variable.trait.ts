import type { Entity } from "../entities/Entity";
import { evalValue } from "../script/engine/eval.script";
import type { ArgExpression } from "../types/value.types";
import type { TVars } from "../utils/vars.utils";
import { Trait } from "./Trait";

type TParams = { vars: TVars; propName: string; varName?: string; text?: ArgExpression | string };
export class VariableTrait extends Trait {
	private propName: string;
	private value: () => unknown;

	constructor({ vars, propName, varName, text }: TParams) {
		super();
		this.propName = propName;
		if (varName) {
			this.value = () => vars.get(varName);
			return;
		}
		if (text) {
			this.value = () => evalValue({ vars: vars }, text);
			return;
		}

		throw new TypeError("VariableTrait needs either a varName or a text");
	}

	update({ dt }, entity: Entity) {
		entity[this.propName] = this.value();
	}
}
