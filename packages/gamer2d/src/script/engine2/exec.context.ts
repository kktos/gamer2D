import type { Font, GameContext } from "../../game";
import type { Scene } from "../../scenes";
import type { NeatVariableStore } from "../../utils/vars.store";
import type { TAlignType } from "../compiler2/types/align.type";
import type { TNeatCommand } from "../compiler2/types/commands.type";
import type { NeatFunctions } from "./functions/functions.store";

// Command execution context - holds rendering state, variables, etc.
export interface ExecutionContext {
	variables: NeatVariableStore;
	functions: NeatFunctions;

	// Current rendering state
	currentFont?: Font;
	currentFontSize?: number;
	currentColor?: string;
	currentBgColor?: string;
	currentAlign?: TAlignType;
	currentVAlign?: TAlignType;
	currentZoom?: number;

	currentScene?: Scene;

	gc: GameContext;

	currentOrigin: {
		x: number;
		y: number;
	}[];

	buttons?: Map<string, TNeatCommand[]>;

	// [key: string]: unknown;
}

export function addButtonDefinition(id: string, commands: TNeatCommand[], context: ExecutionContext) {
	if (!context.buttons) context.buttons = new Map();
	context.buttons.set(id, commands);
}

export function getButtonDefinition(id: string, context: ExecutionContext) {
	return context.buttons?.get(id);
}

export function pushOrigin(x: number, y: number, context: ExecutionContext) {
	context.currentOrigin.push({ x, y });
}
export function popOrigin(context: ExecutionContext) {
	context.currentOrigin.pop();
}
export function getOrigin(context: ExecutionContext) {
	return context.currentOrigin[context.currentOrigin.length - 1];
}
export function toOrigin(x: number, y: number, context: ExecutionContext) {
	const origin = getOrigin(context);
	return { x: x + origin.x, y: y + origin.y };
}
