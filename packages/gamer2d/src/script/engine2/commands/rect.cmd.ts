import { type RectDTO, RectEntity } from "../../../entities/rect.entity";
import { Events } from "../../../events";
import type { GameContext } from "../../../game";
import type { TNeatRectCommand } from "../../compiler2/types/commands.type";
import { type ExecutionContext, toOrigin } from "../exec.context";
import { evalExpressionAs } from "../expr.eval";
import { addAnims } from "./shared/add.anims";
import { addTraits } from "./shared/add.traits";

export function executeRectCommand(command: TNeatRectCommand, context: ExecutionContext) {
	let relativeX = evalExpressionAs(command.at.x, context, "number");
	let relativeY = evalExpressionAs(command.at.y, context, "number");
	let width = evalExpressionAs(command.size.width, context, "number");
	let height = evalExpressionAs(command.size.height, context, "number");

	// Handle padding if present
	let padding = [0, 0];
	if (command.pad) padding = [evalExpressionAs(command.pad[0], context, "number"), evalExpressionAs(command.pad[1], context, "number")];

	relativeX = relativeX - padding[0];
	relativeY = relativeY - padding[1];
	width = width + padding[0] * 2;
	height = height + padding[1] * 2;

	const color = command.color ?? context.currentColor ?? "white";

	let fill: string | undefined;
	if (command.fill) fill = command.fill;

	const at = toOrigin(relativeX, relativeY, context);

	const gc = context.gc as GameContext;
	const rectObj: RectDTO = {
		x: at.x,
		y: at.y,
		width,
		height,
		strokecolor: color,
		fillcolor: fill,
	};
	const entity = new RectEntity(rectObj);
	if (command.id) entity.id = command.id;

	if (command.anims) addAnims(command.anims, entity, context);
	if (command.traits) addTraits(command.traits, entity, context);

	gc.scene?.addTask(Events.TASK_ADD_ENTITY, entity);

	return entity;
}
