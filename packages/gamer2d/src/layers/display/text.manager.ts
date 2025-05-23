import type { Entity } from "../../entities/Entity";
import { type TextDTO, TextEntity } from "../../entities/text.entity";
import { ALIGN_TYPES } from "../../script/compiler/layers/display/layout/text-sprite-props.rules";
import type { TText } from "../../script/compiler/layers/display/layout/text.rules";
import type { TFunctionCall } from "../../script/compiler/shared/action.rules";
import { evalArg, evalNumber, evalValue, isStringInterpolable } from "../../script/engine/eval.script";
import { PathTrait, type TPathDefDTO } from "../../traits/path.trait";
import type { TVars } from "../../utils/vars.utils";
import type { DisplayLayer } from "../display.layer";
import { EntitiesLayer } from "../entities.layer";
import { setupVariableProps } from "./prop.manager";
import { addTraits } from "./trait.manager";

export function addText(layer: DisplayLayer, op: TText & { entity?: Entity }) {
	const posX = evalValue({ vars: layer.vars }, op.pos[0]) as number;
	const posY = evalValue({ vars: layer.vars }, op.pos[1]) as number;

	const textObj: TextDTO = {
		pos: [posX, posY],
		align: op.align,
		valign: op.valign ?? ALIGN_TYPES.TOP,
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
	if (op.traits) addTraits(op.traits, entity, layer.vars);
	setupVariableProps(op, entity, layer.vars);

	const sprites = layer.vars.get("sprites") as Map<string, Entity>; // as TVarSprites;
	if (!sprites) throw new Error("No variable sprites !?!");
	sprites.set(entity.id, entity); //.add(entity);

	layer.scene.addTask(EntitiesLayer.TASK_ADD_ENTITY, entity);
	return entity;
}

// handling with PathTrait of "def anim"
function setupAnim(op: TText & { entity?: Entity }, entity: Entity, vars: TVars) {
	if (!op.anim) return;

	const anim = vars.get(op.anim.name) as { path: TFunctionCall[]; speed: number };
	if (!anim) {
		throw new Error(`Animation ${op.anim.name} not found`);
	}
	const animDTO: TPathDefDTO = {
		path: anim.path,
		speed: anim.speed,
	};
	entity.addTrait(new PathTrait(animDTO, { evalArg: (arg) => evalArg({ vars }, arg) }));
}
