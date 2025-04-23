import type { Entity } from "../../entities/Entity";
import { type TextDTO, TextEntity } from "../../entities/text.entity";
import type { TText } from "../../script/compiler/display/layout/text.rules";
import { evalArg, evalNumber, evalValue, isStringInterpolable } from "../../script/engine/eval.script";
import type { Trait } from "../../traits/Trait";
import { type PathDefDTO, PathTrait } from "../../traits/path.trait";
import { VariableTrait } from "../../traits/variable.trait";
import type { TVars } from "../../types/engine.types";
import { ArgExpression, ArgVariable } from "../../types/value.types";
import type { DisplayLayer } from "../display.layer";
import { EntitiesLayer } from "../entities.layer";

export function addText(layer: DisplayLayer, op: TText & { entity?: Entity }) {
	const posX = evalValue({ vars: layer.vars }, op.pos[0]);
	const posY = evalValue({ vars: layer.vars }, op.pos[1]);

	const textObj: TextDTO = {
		pos: [posX, posY],
		align: op.align,
		valign: op.valign,
		size: op.size,
		color: op.color,
		bgcolor: op.bgcolor?.value,
		text: isStringInterpolable(op.text) ? "" : op.text,
	};
	if (op.width) textObj.width = evalNumber({ vars: layer.vars }, op.width);
	if (op.height) textObj.height = evalNumber({ vars: layer.vars }, op.height);

	const entity = new TextEntity(layer.gc.resourceManager, textObj);
	if (op.id) entity.id = op.id;

	if (op.anim) setupAnim(op, entity, layer.vars);
	if (op.traits) setupTraits(op, entity, layer.vars);
	setupVariableProps(op, entity, layer.vars);

	layer.scene.addTask(EntitiesLayer.TASK_ADD_ENTITY, entity);
	return entity;
}

// handling with PathTrait of "def anim"
function setupAnim(op: TText & { entity?: Entity }, entity: Entity, vars: TVars) {
	const anim = vars.get(op.anim.name) as { path: unknown[]; speed: number };
	if (!anim) {
		throw new Error(`Animation ${op.anim.name} not found`);
	}
	const animDTO: PathDefDTO = {
		path: anim.path,
		speed: anim.speed,
	};
	entity.addTrait(new PathTrait(animDTO, { evalArg: (arg) => evalArg({ vars }, arg) }));
}

// handling of "traits:[ trait1, trait2, ...]"
function setupTraits(op: TText & { entity?: Entity }, entity: Entity, vars: TVars) {
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

// handling with VariableTrait of some props with variable value
function setupVariableProps(op: TText & { entity?: Entity }, entity: Entity, vars: TVars) {
	const varProps = [
		{ propName: "pos", alias: ["left", "top"] },
		{ propName: "width", alias: "width" },
		{ propName: "height", alias: "height" },
		{ propName: "text", alias: "text" },
	];
	const addTrait = (prop, alias) => {
		if (typeof prop === "number") return;
		if (typeof prop === "string") {
			if (isStringInterpolable(prop)) {
				entity.addTrait(new VariableTrait({ vars, propName: alias, text: op.text }));
			}
			return;
		}
		if (prop instanceof ArgVariable) {
			entity.addTrait(new VariableTrait({ vars, propName: alias, varName: prop.value }));
			return;
		}
		if (prop instanceof ArgExpression) entity.addTrait(new VariableTrait({ vars, propName: alias, text: op.text }));
	};
	for (const { propName, alias } of varProps) {
		if (Array.isArray(op[propName])) {
			for (let idx = 0; idx < op[propName].length; idx++) {
				addTrait(op[propName][idx], alias[idx]);
			}
			continue;
		}
		addTrait(op[propName], alias);
	}
}
