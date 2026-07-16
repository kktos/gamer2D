import { type TextDTO, TextEntity } from "../../../entities";
import { Events } from "../../../events";
import type { GameContext } from "../../../game";
import { reactiveExpression } from "../../../utils/reactive.utils";
import { Signal, signal } from "../../../utils/signals.util";
import type { TNeatTextCommand } from "../../compiler2/types/commands.type";
import { type ExecutionContext, getOrigin } from "../exec.context";
import { evalExpression, evalExpressionAs } from "../expr.eval";
import { interpolateString } from "../string.eval";
import { alignToNumber } from "./align.cmd";
import { evalFont } from "./font.cmd";
import { addAnims } from "./shared/add.anims";
import { addTraits } from "./shared/add.traits";

export function executeTextCommand(command: TNeatTextCommand, context: ExecutionContext) {
	const srcString = String(evalExpression(command.value, context));
	const text = reactiveExpression((varsUsed) => interpolateString(srcString, context, varsUsed), context.variables);

	const origin = getOrigin(context);
	const xProp = reactiveExpression((varsUsed) => {
		let value = evalExpression(command.at.x, context, varsUsed);
		if (typeof value === "number") value += origin.x;
		return value;
	}, context.variables);
	const yProp = reactiveExpression((varsUsed) => {
		let value = evalExpression(command.at.y, context, varsUsed);
		if (typeof value === "number") value += origin.y;
		return value;
	}, context.variables);

	const gc = context.gc as GameContext;
	const textObj: TextDTO = {
		x: typeof xProp.value === "number" ? (xProp as Signal<number>) : signal(0),
		y: typeof yProp.value === "number" ? (yProp as Signal<number>) : signal(0),
		size: context.currentFontSize ?? 1,
		bgcolor: context.currentBgColor,
		text,
		// isDynamic: !!op.isDynamic,
	};

	if (command.color) {
		// because TS can't see it's defined
		const cmdColor = command.color;
		const color = reactiveExpression(
			(varsUsed) => evalExpressionAs(cmdColor, context, "string", varsUsed),
			context.variables,
		);
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

	// let align: ReturnType<typeof evalAlign> | undefined;
	if (context.currentAlign) {
		// align = { h: context.currentAlign, v: context.currentVAlign };
		textObj.align = context.currentAlign;
		if (context.currentVAlign) textObj.valign = context.currentVAlign;
	}

	if (typeof xProp.value === "string") {
		textObj.align = alignToNumber(xProp.value);
	}
	if (typeof yProp.value === "string") {
		textObj.valign = alignToNumber(yProp.value);
	}

	// if (command.boxAlign) align = evalAlign(command.boxAlign);
	// else if (context.currentAlign) align = { h: context.currentAlign, v: context.currentVAlign };

	const entity = new TextEntity(textObj);
	if (command.id) entity.id = command.id;

	if (command.anims) addAnims(command.anims, entity, context);
	if (command.traits) addTraits(command.traits, entity, context);

	gc.scene?.addTask(Events.TASK_ADD_ENTITY, entity);

	return entity;
}
