import type { Entity } from "../../entities/Entity";
import { EntityPool } from "../../entities/EntityPool";
import type { TPool } from "../../script/compiler/layers/display/layout/pool.rules";
import { evalValue } from "../../script/engine/eval.script";
import type { DisplayLayer } from "../display.layer";
import { EntitiesLayer } from "../entities.layer";
import { setupTraits } from "./trait.manager";

export function addPool(layer: DisplayLayer, op: TPool & { entity?: Entity }) {
	const posX = evalValue({ vars: layer.vars }, op.pos[0]) as number;
	const posY = evalValue({ vars: layer.vars }, op.pos[1]) as number;
	const count = evalValue({ vars: layer.vars }, op.count) as number;
	const spawnCount = evalValue({ vars: layer.vars }, op.spawn) as number;

	// const entity = createEntityByName(layer.gc.resourceManager, op.sprite, posX, posY);
	const entityPool = EntityPool.create(layer.gc.resourceManager, op.sprite, count, posX, posY);
	if (op.id) entityPool.id = op.id;

	if (op.traits) setupTraits(op, entityPool.pool, layer.vars);
	// setupVariableProps(op, entity, layer.vars);

	const sprites = layer.vars.get("sprites") as Map<string, Entity>; // as TVarSprites;
	if (!sprites) throw new Error("No variable sprites !?!");
	sprites.set(entityPool.id, entityPool);

	for (let idx = 0; idx < spawnCount; idx++) entityPool.use();

	layer.scene.addTask(EntitiesLayer.TASK_ADD_ENTITY, entityPool);

	return entityPool;
}
