import type { Entity } from "../../entities/Entity";
import { EntityPool } from "../../entities/EntityPool";
import type { TPool } from "../../script/compiler/layers/display/layout/pool.rules";
import { evalValue } from "../../script/engine/eval.script";
import { EntitiesLayer } from "../entities.layer";
import type { UiLayer } from "../ui.layer";
import { addTraits } from "./trait.manager";

export function addPool(layer: UiLayer, op: TPool & { entity?: Entity }) {
	const posX = evalValue({ vars: layer.vars }, op.pos[0]) as number;
	const posY = evalValue({ vars: layer.vars }, op.pos[1]) as number;
	const count = evalValue({ vars: layer.vars }, op.count) as number;
	const spawnCount = op.spawn ? (evalValue({ vars: layer.vars }, op.spawn) as number) : 0;

	// const entity = createEntityByName(layer.gc.resourceManager, op.sprite, posX, posY);
	const entityPool = EntityPool.create(layer.gc.resourceManager, op.id, op.sprite, count, posX, posY);

	if (op.traits) addTraits(op.traits, entityPool.pool, layer.vars);
	// setupVariableProps(op, entity, layer.vars);

	const sprites = layer.vars.get("sprites") as Map<string, Entity>; // as TVarSprites;
	if (!sprites) throw new Error("No variable sprites !?!");
	sprites.set(entityPool.id, entityPool);

	for (let idx = 0; idx < spawnCount; idx++) entityPool.use();

	layer.scene.addTask(EntitiesLayer.TASK_ADD_ENTITY, entityPool);

	return entityPool;
}
