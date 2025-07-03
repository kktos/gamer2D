import { type TextDTO, TextEntity } from "../../../entities";
import type { GameContext } from "../../../game";
import { EntitiesLayer } from "../../../layers";
import { reactiveExpression } from "../../../utils/reactive.utils";
import type { TNeatTextCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";
import { evalExpressionAs } from "../expr.eval";
import { interpolateString } from "../string.eval";
import { evalAlign } from "./align.cmd";
import { evalFont } from "./font.cmd";
import { addAnims } from "./shared/add.anims";
import { addTraits } from "./shared/add.traits";

export function executeTextCommand(command: TNeatTextCommand, context: ExecutionContext) {
	const srcString = evalExpressionAs(command.value, context, "string");
	const text = reactiveExpression((varsUsed) => interpolateString(srcString, context, varsUsed), context.variables);

	const x = reactiveExpression((varsUsed) => evalExpressionAs(command.at.x, context, "number", varsUsed), context.variables);
	const y = reactiveExpression((varsUsed) => evalExpressionAs(command.at.y, context, "number", varsUsed), context.variables);

	let align: ReturnType<typeof evalAlign> | undefined;

	if (command.align) align = evalAlign(command.align);
	else if (context.currentAlign) align = { h: context.currentAlign, v: context.currentVAlign };

	const gc = context.gc as GameContext;
	const textObj: TextDTO = {
		x,
		y,
		size: context.currentFontSize ?? 1,
		bgcolor: context.currentBgColor,
		text,
		// isDynamic: !!op.isDynamic,
	};

	if (command.color) {
		// because TS can't see it's defined
		const cmdColor = command.color;
		const color = reactiveExpression((varsUsed) => evalExpressionAs(cmdColor, context, "string", varsUsed), context.variables);
		textObj.color = color;
	}
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

	if (command.anims) addAnims(command.anims, entity, context);
	if (command.traits) addTraits(command.traits, entity, context);

	gc.scene?.addTask(EntitiesLayer.TASK_ADD_ENTITY, entity);

	return entity;
}
