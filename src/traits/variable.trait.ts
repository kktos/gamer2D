import type { Entity } from "../entities/Entity";
import { evalString } from "../script/engine/eval.script";
import type { TVars } from "../types/engine.types";
import { Trait } from "./Trait";

export class VariableTrait extends Trait {
	private propName: string;
	private varName?: string;
	private text?: string;
	private vars: TVars;
	private value: () => unknown;

	constructor({ vars, propName, varName = null, text = null }) {
		super();
		this.varName = varName;
		this.text = text;
		this.propName = propName;
		this.vars = vars;
		if (varName) {
			this.value = () => this.vars.get(this.varName);
		} else {
			this.value = () => evalString({ vars: this.vars }, this.text);
		}
	}

	update({ dt }, entity: Entity) {
		entity[this.propName] = this.value();
	}
}
