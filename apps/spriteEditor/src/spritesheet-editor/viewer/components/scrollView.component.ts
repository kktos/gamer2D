import type { GameContext } from "gamer2d/game/types/GameContext";
import { BBox } from "gamer2d/maths/BBox.class";
import type { Point, Rect } from "gamer2d/maths/math";
import { CanvasHorizontalScrollbar } from "./hscrollbar.component.js";

export class ScrollView {
	private scrollbar: CanvasHorizontalScrollbar;
	public bounds: BBox;
	private sbPos: Point;
	public scrollOffset = 0;
	private renderer: (ctx: CanvasRenderingContext2D, scrollOffset: number) => void;

	constructor(_bounds: Rect, _renderer: (ctx: CanvasRenderingContext2D, scrollOffset: number) => void) {
		this.bounds = BBox.create(_bounds);
		this.sbPos = { x: 5, y: _bounds.height - 10 };
		this.renderer = _renderer;
		this.scrollbar = new CanvasHorizontalScrollbar(_bounds.width - 10, 8, (value) => {
			this.scrollOffset = -value;
		});
		this.scrollbar.setScroll(0, 100, 0, 10);
	}

	public setScroll(min: number, max: number, value: number, page: number) {
		this.scrollbar.setScroll(min, max, value, page);
	}
	public setThumb(value: number) {
		this.scrollbar.setThumb(value);
	}

	public handleEvent(gc: GameContext, e): boolean {
		return this.bounds.isPointInside(e.x, e.y) ? this.scrollbar.handleEvent(gc, e) : false;
	}

	public render(ctx: CanvasRenderingContext2D) {
		ctx.save();
		ctx.translate(this.bounds.left, this.bounds.top);
		this.renderer(ctx, this.scrollOffset);
		this.scrollbar.draw(ctx, this.sbPos.x, this.sbPos.y);
		ctx.restore();
	}
}
