import type { Font } from "gamer2d/game/Font";
import type { KeyMap } from "gamer2d/game/KeyMap";
import type { GameContext } from "gamer2d/game/types/GameContext";
import { BBox } from "gamer2d/maths/BBox.class";
import type { Rect } from "gamer2d/maths/math";
import { ALIGN_TYPES } from "gamer2d/script/compiler/layers/display/layout/text-sprite-props.rules";
import { confirmDialog } from "../../shared/dialog.class.js";
import type { Signal } from "../../shared/signal.class.js";
import { ScrollView } from "./scrollView.component.js";
import type { SpriteItemList } from "./spriteitemlist.class.js";

const GRID_LEFT = 10;
const GRID_TOP = 20;
const GRID_XGAP = 10;
const SCROLLBAR_AREA_HEIGHT = 20;
const CONTROLS_AREA_HEIGHT = GRID_TOP + SCROLLBAR_AREA_HEIGHT;

export class SpritesView extends ScrollView {
	static EVENT_DELETE_ITEMS = Symbol.for("DELETE_ITEMS");

	private gc: GameContext;
	public selected: Signal<string | undefined>;
	public selectedList: Signal<Set<string> | undefined>;
	private hoveredIdx = -1;
	private selectedIdxList: number[] = [];
	public selectedNameList: Set<string> = new Set();
	private font: Font;
	private _list!: SpriteItemList;
	private title: string;
	public localBounds: BBox;

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
		this.localBounds = BBox.copy(this.bounds);
		this.localBounds.top = 0;
		this.localBounds.left = 0;

		// selectedList.subscribe((list) => {
		// 	console.log("update list", list);
		// 	this.selectedNameList = list ?? new Set();
		// });
	}

	set list(list: SpriteItemList) {
		this._list = list;

		let xpos = GRID_LEFT;
		list.forEach((_, __, bbox) => {
			bbox.left = xpos;
			bbox.top = GRID_TOP;
			const height = Math.min(bbox.height, this.bounds.height - CONTROLS_AREA_HEIGHT);
			bbox.width = Math.floor(bbox.width / (bbox.height / height));
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

	public handleEvent(gc: GameContext, e) {
		if (!this._list) return false;

		if (super.handleEvent(gc, e)) return true;

		switch (e.type) {
			case "keyup": {
				if (!this.localBounds.isPointInside(e.x, e.y)) return false;

				if (e.key === "a" && gc.keys.isPressed("Control")) {
					this.selectedNameList.clear();
					this.selectedIdxList.length = 0;
					for (let i = 0; i <= this._list.length - 1; i++) {
						const item = this._list.get(i);
						this.selectedNameList.add(item.name);
						this.selectedIdxList.push(i);
					}
					this.selectedList.value = this.selectedNameList;
					this.selectedList.notify();
					return true;
				}
				if (e.key === "Delete" && this.selectedNameList.size) {
					const text =
						this.selectedNameList.size > 1 ? `Delete those ${this.selectedNameList.size} ${this.title} ?` : `Delete this ${this.title.replace(/s$/, "")} ?`;
					confirmDialog(text, "Delete", "Cancel").then((wannaDelete) => {
						if (wannaDelete) this.gc.scene?.emit(SpritesView.EVENT_DELETE_ITEMS, this._list.name, this.selectedNameList);
					});
					return true;
				}
				break;
			}
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
		const item = this._list.get(this.hoveredIdx);
		this.selected.value = item.name;

		if (!keys.isPressed("Shift") && !keys.isPressed("Control")) {
			this.selectedIdxList = [this.hoveredIdx];
			this.selectedNameList.clear();
			this.selectedNameList.add(item.name);
			this.selectedList.value = this.selectedNameList;
			this.selectedList.notify();
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
				const item = this._list.get(i);
				this.selectedNameList.add(item.name);
			}
		}

		if (keys.isPressed("Control")) {
			const foundIdx = this.selectedNameList.has(item.name);
			if (foundIdx) {
				this.selectedIdxList = this.selectedIdxList.filter((idx) => idx !== this.hoveredIdx);
				this.selectedNameList.delete(item.name);
			} else {
				this.selectedNameList.add(item.name);
				this.selectedIdxList.push(this.hoveredIdx);
			}
		}

		this.selectedList.value = this.selectedNameList;
		this.selectedList.notify();
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

		this._list.forEach((name, item, bbox, idx) => {
			if (idx === this.hoveredIdx) {
				this.font.print({
					ctx,
					text: `${name} ${item.width}x${item.height}`,
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
