import { type TextDTO, TextEntity } from "../../../entities";
import type { GameContext } from "../../../game";
import { EntitiesLayer } from "../../../layers";
import type { ArgColor } from "../../../types";
import type { TNeatTextCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";
import { evalExpressionAs } from "../expr.eval";
import { interpolateString } from "../string.eval";
import { evalAlign } from "./align.cmd";
import { evalFont } from "./font.cmd";

export function executeTextCommand(
	command: TNeatTextCommand,
	context: ExecutionContext,
) {
	const text = interpolateString(
		evalExpressionAs(command.value, context, "string"),
		context,
	);

	const x = evalExpressionAs(command.at.x, context, "number");
	const y = evalExpressionAs(command.at.y, context, "number");
	let align: ReturnType<typeof evalAlign> | undefined;

	if (command.align) align = evalAlign(command.align);
	else if (context.currentAlign)
		align = { h: context.currentAlign, v: context.currentVAlign };

	const gc = context.gc as GameContext;
	const textObj: TextDTO = {
		pos: [x, y],
		color: { value: context.currentColor ?? "white" } as ArgColor,
		size: context.currentFontSize ?? 1,
		// bgcolor: op.bgcolor?.value,
		text,
		// isDynamic: !!op.isDynamic,
	};

	if (command.font) {
		const font = evalFont(command.font);
		if (font.font) textObj.font = font.font;
		if (font.size) textObj.size = font.size;
	}

	if (command.size) {
		textObj.width = evalExpressionAs(command.size.width, context, "number");
		textObj.height = evalExpressionAs(command.size.height, context, "number");
	}

	if (align) {
		textObj.align = align.h;
		if (align.v) textObj.valign = align.v;
	}

	const entity = new TextEntity(gc.resourceManager, textObj);
	if (command.id) entity.id = command.id;

	gc.scene?.addTask(EntitiesLayer.TASK_ADD_ENTITY, entity);
}
