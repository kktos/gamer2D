import type GameContext from "../../../game/types/GameContext";
import type { TVars } from "../../../types/engine.types";
import type { UILayer } from "../../UILayer";
import { System } from "./System.view";
import { DebugView } from "./debug.view";

export const SYSTEM = Symbol.for("System");

export const views = {
	DebugView,
};

export type ViewContext = {
	canvas: HTMLCanvasElement;
	gc: GameContext;
	vars: TVars;
	layer: UILayer;
};

export function initViews(ctx: ViewContext) {
	views[SYSTEM] = new System(ctx);
}
