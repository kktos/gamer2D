import { createEntityByName } from "../../../entities";
import { Events } from "../../../events";
import type { GameContext } from "../../../game";
import { DIRECTIONS } from "../../../types";
import type { TNeatSpriteCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";
import { evalExpressionAs } from "../expr.eval";
import { interpolateString } from "../string.eval";
import { addAnims } from "./shared/add.anims";
import { addTraits } from "./shared/add.traits";

export function executeSpriteCommand(command: TNeatSpriteCommand, context: ExecutionContext) {
	const gc = context.gc as GameContext;

	const srcString = evalExpressionAs(command.name, context, "string");
	const name = interpolateString(srcString, context);

	const x = evalExpressionAs(command.at.x, context, "number");
	const y = evalExpressionAs(command.at.y, context, "number");
	const width = command.size ? evalExpressionAs(command.size.width, context, "number") : undefined;
	const height = command.size ? evalExpressionAs(command.size.height, context, "number") : undefined;

	const spriteDTO = {
		at: { x, y },
		name,
		dir: command.dir === "right" ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT,
	};
	const entity = createEntityByName(gc.resourceManager, name, spriteDTO);
	if (command.id) entity.id = command.id;
	if (context.currentZoom) entity.zoom = context.currentZoom;

	if (width) entity.bbox.width = width;
	if (height) entity.bbox.height = height;

	if (command.anims) addAnims(command.anims, entity, context);
	if (command.traits) addTraits(command.traits, entity, context);

	gc.scene?.addTask(Events.TASK_ADD_ENTITY, entity);

	return entity;
}
