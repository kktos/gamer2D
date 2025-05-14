import type { GameContext } from "../../../game/types/GameContext";
import type { TViewDefinition } from "../../../game/types/GameOptions";
import { getClassName } from "../../../utils/object.util";
import type { TVars } from "../../../utils/vars.utils";
import type { UILayer } from "../../UILayer";
import { System } from "./System.view";
import { DebugView } from "./debug.view";

export const SYSTEM = Symbol.for("System");

export const viewClasses = {
	DebugView,
};
const viewNames = {};

export type ViewContext = {
	canvas: HTMLCanvasElement;
	gc: GameContext;
	vars: TVars;
	layer: UILayer;
};

export function initViews(ctx: ViewContext) {
	viewClasses[SYSTEM] = new System(ctx);
}

export function setupView(def: TViewDefinition) {
	const { name, classType } = def;
	const className = getClassName(classType);
	if (viewClasses[className]) return;
	viewNames[name] = classType;
	viewClasses[className] = classType;
}
