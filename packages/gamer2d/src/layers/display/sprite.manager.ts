import type { Entity } from "../../entities/Entity";
import { createEntityByName } from "../../entities/Entity.factory";
import type { TSprite } from "../../script/compiler/layers/display/layout/sprite.rules";
import type { TFunctionCall } from "../../script/compiler/shared/action.rules";
import { evalArg, evalNumberValue } from "../../script/engine/eval.script";
import { type PathDefDTO, PathTrait } from "../../traits/path.trait";
import type { DisplayLayer } from "../display.layer";
import { EntitiesLayer } from "../entities.layer";
import { setupVariableProps } from "./prop.manager";
import { addTraits } from "./trait.manager";

// addSprite(op:TSprite & { entity: Entity }) {
export function addSprite(layer: DisplayLayer, op: TSprite & { entity?: Entity }) {
	const posX = evalNumberValue({ vars: layer.vars }, op.pos[0]);
	const posY = evalNumberValue({ vars: layer.vars }, op.pos[1]);
	const dir = op.dir ? evalNumberValue({ vars: layer.vars }, op.dir) : op.dir;

	const entity = createEntityByName(layer.gc.resourceManager, op.name, posX, posY, dir);
	if (op.id) entity.id = op.id;

	if (op.width !== undefined) entity.bbox.width = evalNumberValue({ vars: layer.vars }, op.width);
	if (op.height !== undefined) entity.bbox.height = evalNumberValue({ vars: layer.vars }, op.height);

	if (op.anim) {
		const anim = layer.vars.get(op.anim.name) as { path: TFunctionCall[]; speed: number };
		if (!anim) {
			throw new Error(`Animation ${op.anim.name} not found`);
		}
		const animDTO: PathDefDTO = {
			path: anim.path,
			speed: anim.speed,
		};
		entity.addTrait(new PathTrait(animDTO, { evalArg: (arg) => evalArg({ vars: layer.vars }, arg) }));
	}

	if (op.traits) addTraits(op.traits, entity, layer.vars);
	setupVariableProps(op, entity, layer.vars);

	const sprites = layer.vars.get("sprites") as Map<string, Entity>; // as TVarSprites;
	if (!sprites) throw new Error("No variable sprites !?!");
	sprites.set(entity.id, entity); //.add(entity);

	layer.scene.addTask(EntitiesLayer.TASK_ADD_ENTITY, entity);

	return entity;
}
