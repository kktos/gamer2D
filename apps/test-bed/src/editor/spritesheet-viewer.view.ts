import type { Font } from "gamer2d/game/Font";
import { SpriteSheet } from "gamer2d/game/Spritesheet";
import type { GameContext } from "gamer2d/game/types/GameContext";
import { View } from "gamer2d/layers/display/views/View";
import type { ViewContext } from "gamer2d/layers/display/views/View.factory";
import { BBox } from "gamer2d/maths/BBox.class";

const GRID_XPOS_START = 10;
const SPRITES_YPOS_START = 20;
const ANIMS_YPOS_START = 85;
const GRID_XGAP = 10;
const GRID_YGAP = 15;

export class SpritesheetViewerView extends View {
	private _spritesheet: SpriteSheet | undefined;
	private bboxList: BBox[] = [];
	private selectedSprite = -1;
	private isDragging = false;
	private lastMouseX = 0;
	private listWidth = 0;
	private imageOffsetX = 0;
	private font: Font;

	constructor(ctx: ViewContext) {
		super(ctx);
		this._spritesheet = undefined;
		const rsrcMngr = ctx.gc.resourceManager;
		this.font = rsrcMngr.get("font", rsrcMngr.mainFontName);
		this.font.size = 1;
	}

	destroy() {}

	set spritesheet(spritesheet: SpriteSheet) {
		if (!(spritesheet instanceof SpriteSheet)) throw new TypeError("Invalid spritesheet");
		this._spritesheet = spritesheet;
		this.prepareRender();
	}

	prepareRender() {
		if (!this._spritesheet) return;

		this.bboxList = [];
		let xpos = GRID_XPOS_START;
		const ypos = SPRITES_YPOS_START;
		this._spritesheet.sprites.forEach((sprite, key) => {
			const height = Math.min(sprite[0].height, ANIMS_YPOS_START - SPRITES_YPOS_START);
			const width = sprite[0].width / (sprite[0].height / height);
			const bbox = new BBox(xpos, ypos, width, height);
			this.bboxList.push(bbox.inflate(1));
			xpos += width + GRID_XGAP;
		});
		this.listWidth = xpos;
	}

	handleEvent(gc, e): void {
		// console.log("Viewer", e);
		switch (e.type) {
			case "mousemove": {
				if (this.isDragging) {
					gc.viewport.canvas.style.cursor = "grabbing";
					this.doDrag(gc, e);
					return;
				}
				this.selectedSprite = this.bboxList.findIndex((bbox) => bbox.isPointInside(e.x - this.imageOffsetX, e.y));

				gc.viewport.canvas.style.cursor = this.selectedSprite === -1 ? "grab" : "default";
				break;
			}
			case "mouseup": {
				this.isDragging = false;
				gc.viewport.canvas.style.cursor = "default";
				break;
			}
			case "mousedown":
				if (this.bboxList.findIndex((bbox) => bbox.isPointInside(e.x - this.imageOffsetX, e.y)) !== -1) return;

				this.isDragging = true;
				this.lastMouseX = e.x;

				break;
		}
	}

	doDrag(gc, e) {
		const deltaX = e.x - this.lastMouseX;
		const newOffset = this.imageOffsetX + deltaX;

		if (newOffset <= 0 && this.listWidth > this.canvas.width && this.listWidth - this.canvas.width + newOffset > 0) {
			this.ctx.translate(deltaX, 0);
			this.imageOffsetX = newOffset;
		}

		this.lastMouseX = e.x;
	}

	render(gc: GameContext) {
		this.ctx.fillStyle = "black";
		this.ctx.fillRect(-this.imageOffsetX, 0, this.canvas.width, this.canvas.height);
		if (this._spritesheet) {
			this.ctx.font = "8px monospace";

			const ss = this._spritesheet;
			let xpos = GRID_XPOS_START;
			let ypos = SPRITES_YPOS_START - 8;

			this.font.print({ ctx: this.ctx, text: `Sprites: ${ss.sprites.size}`, x: 10, y: ypos - 6 });

			let idx = 0;
			ypos = SPRITES_YPOS_START;
			ss.sprites.forEach((sprite, key) => {
				const bbox = this.bboxList[idx];
				if (idx === this.selectedSprite) {
					this.font.print({ ctx: this.ctx, text: `${key} ${sprite[0].width}x${sprite[0].height}`, x: 100, y: SPRITES_YPOS_START - 14 });
				}

				this.ctx.strokeStyle = idx === this.selectedSprite ? "red" : "#DDD";
				this.ctx.strokeRect(bbox.left, bbox.top, bbox.width, bbox.height);

				this.ctx.drawImage(sprite[0], bbox.left + 1, bbox.top + 1, bbox.width - 2, bbox.height - 2);

				idx++;
			});

			xpos = GRID_XPOS_START;
			ypos = ANIMS_YPOS_START + GRID_YGAP;
			this.font.print({ ctx: this.ctx, text: `Animations: ${ss.animations.size}`, x: xpos, y: ypos - 3 });
			ypos += 10;
			ss.animations.forEach((anim, key) => {
				const sprite = ss.sprites.get(anim.frame(gc.tick));
				if (!sprite) return;
				this.ctx.drawImage(sprite[0], xpos, ypos, sprite[0].width, sprite[0].height);
				this.ctx.strokeStyle = "#DDD";
				this.ctx.strokeRect(xpos - 1, ypos - 1, sprite[0].width + 2, sprite[0].height + 2);
				xpos += sprite[0].width + GRID_XGAP;
			});
		}
	}
}
