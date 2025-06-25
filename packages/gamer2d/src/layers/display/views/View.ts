import type { GameContext } from "../../../game/types/GameContext";
import type { TVars } from "../../../utils/vars.utils";
import type { HTMLLayer } from "../../HTMLLayer";
import type { ViewContext } from "./View.factory";

export class View {
	public canvas: HTMLCanvasElement;
	public ctx: CanvasRenderingContext2D;
	public gc: GameContext;
	public vars: TVars;
	public layer: HTMLLayer;

	constructor(ctx: ViewContext) {
		this.canvas = ctx.canvas;
		this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;
		this.ctx.imageSmoothingEnabled = false;
		this.gc = ctx.gc;
		this.vars = ctx.vars;
		this.layer = ctx.layer;
	}
	handleEvent(_gc: GameContext, _e) {}
	destroy() {}
}
