import type { Font } from "gamer2d/game/Font";
import type { KeyMap } from "gamer2d/game/KeyMap";
import type { GameContext } from "gamer2d/game/types/GameContext";
import { BBox } from "gamer2d/maths/BBox.class";
import type { Rect } from "gamer2d/maths/math";
import { ALIGN_TYPES } from "gamer2d/script/compiler/layers/display/layout/text-sprite-props.rules";
import type { Signal } from "../../shared/signal.class.js";
import { ScrollView } from "./scrollView.component.js";

const GRID_LEFT = 10;
const GRID_TOP = 20;
const GRID_XGAP = 10;

export class SpriteItemList {
	private items: string[] = [];
	private bboxList: BBox[] = [];
	public getImage: ((name: string, tick: number) => HTMLCanvasElement | undefined) | undefined = undefined;

	public add(name: string, { width, height }: { width: number; height: number }) {
		this.bboxList.push(new BBox(0, 0, width, height));
		this.items.push(name);
	}

	public forEach(cb: (name: string, bbox: BBox, idx: number) => void) {
		this.items.forEach((name, idx) => cb(name, this.bboxList[idx], idx));
	}

	public findBboxIndex(x: number, y: number) {
		return this.bboxList.findIndex((bbox) => bbox.isPointInside(x, y));
	}

	public get length() {
		return this.items.length;
	}

	public get(idx: number) {
		return this.items[idx];
	}
}

export class SpritesView extends ScrollView {
	private gc: GameContext;
	private selected: Signal<string | undefined>;
	private selectedList: Signal<Set<string> | undefined>;
	private hoveredIdx = -1;
	private selectedIdxList: number[] = [];
	private selectedNameList: Set<string> = new Set();
	private font: Font;
	private _list!: SpriteItemList;
	private title: string;

	constructor({
		gc,
		bounds,
		title,
		selected,
		selectedList,
	}: { gc: GameContext; title: string; bounds: Rect; selected: Signal<string | undefined>; selectedList: Signal<Set<string> | undefined> }) {
		super(bounds, (ctx, scrollOffset: number) => this.doRender(ctx, this.gc));
		this.gc = gc;
		this.selected = selected;
		this.selectedList = selectedList;
		this.title = title;
		this.font = gc.resourceManager.get("font", gc.resourceManager.mainFontName);
	}

	set list(list: SpriteItemList) {
		this._list = list;

		let xpos = GRID_LEFT;
		list.forEach((_, bbox) => {
			bbox.left = xpos;
			bbox.top = GRID_TOP;
			const height = Math.min(bbox.height, this.bounds.height - 20);
			bbox.width = bbox.width / (bbox.height / height);
			bbox.height = height;
			bbox.inflate(1);
			xpos += bbox.width + GRID_XGAP;
		});

		this.setScroll(0, xpos, 0, this.bounds.width);

		this.hoveredIdx = -1;
		this.selectedIdxList = [];
		this.selectedNameList.clear();

		this.selected.value = undefined;
		this.selectedList.value = undefined;
	}

	public handleEvent(gc: GameContext, e): boolean {
		if (!this._list) return false;

		if (super.handleEvent(gc, e)) return true;

		switch (e.type) {
			case "mousemove": {
				this.hoveredIdx = this._list.findBboxIndex(e.x - this.scrollOffset, e.y);
				break;
			}
			case "mousedown":
				if (this.hoveredIdx !== -1) {
					this.handleSelect(gc.keys, e);
					return true;
				}
				break;
		}
		return false;
	}

	private handleSelect(keys: KeyMap, e: MouseEvent) {
		const name = this._list.get(this.hoveredIdx);
		this.selected.value = name;
		if (!keys.isPressed("Shift") && !keys.isPressed("Control")) {
			this.selectedIdxList = [this.hoveredIdx];
			this.selectedNameList.clear();
			this.selectedNameList.add(name);
			this.selectedList.value = this.selectedNameList;
			return;
		}

		if (keys.isPressed("Shift")) {
			const limits = this.selectedIdxList.reduce(
				(acc, idx) => {
					if (idx > acc.max) acc.max = idx;
					if (idx < acc.min) acc.min = idx;
					return acc;
				},
				{ min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER },
			);

			const startIdx = Math.min(this.hoveredIdx, limits.min);
			const endIdx = this.hoveredIdx > startIdx ? this.hoveredIdx : limits.max;
			this.selectedIdxList = [startIdx, endIdx];
			this.selectedNameList.clear();
			for (let i = startIdx; i <= endIdx; i++) {
				const name = this._list.get(i);
				this.selectedNameList.add(name);
			}
		}

		if (keys.isPressed("Control")) {
			const foundIdx = this.selectedNameList.has(name);
			if (foundIdx) {
				this.selectedIdxList = this.selectedIdxList.filter((idx) => idx !== this.hoveredIdx);
				this.selectedNameList.delete(name);
			} else {
				this.selectedNameList.add(name);
				this.selectedIdxList.push(this.hoveredIdx);
			}
		}

		this.selectedList.value = this.selectedNameList;
	}

	private doRender(ctx: CanvasRenderingContext2D, gc: GameContext) {
		if (!this._list) return;

		this.font.valign = ALIGN_TYPES.CENTER;
		this.font.color = "black";
		this.font.bgcolor = "white";
		this.font.print({
			ctx,
			text: ` ${this.title}: ${this._list.length}`,
			x: 0,
			y: 0,
			width: this.bounds.width,
			height: 13,
		});

		this._list.forEach((name, bbox, idx) => {
			if (idx === this.hoveredIdx) {
				this.font.print({
					ctx,
					text: `${name} ${bbox.width}x${bbox.height}`,
					x: 100,
					y: 6.5,
				});
			}

			ctx.lineWidth = 1;
			ctx.strokeStyle = "#BBB";
			if (this.selectedNameList.has(name)) {
				ctx.strokeStyle = "orange";
				ctx.lineWidth = 2;
			}
			if (idx === this.hoveredIdx) {
				ctx.strokeStyle = this.selectedNameList.has(name) ? "yellow" : "white";
				ctx.lineWidth = 2;
			}
			ctx.strokeRect(bbox.left - 0.5 + this.scrollOffset, bbox.top - 0.5, bbox.width + 1, bbox.height + 1);

			const img = this._list.getImage?.(name, gc.tick);
			if (!img) return;
			ctx.drawImage(img, bbox.left + 1 + this.scrollOffset, bbox.top + 1, bbox.width - 2, bbox.height - 2);
		});
	}
}
