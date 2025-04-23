import type Font from "../../../game/Font";
import type GameContext from "../../../game/GameContext";
import type ResourceManager from "../../../game/ResourceManager";
import type { AnimMap, SpriteMap, SpriteSheet } from "../../../game/Spritesheet";
import { createViewport, drawPixelated } from "../../../utils/canvas.utils";
import type { UILayer } from "../../UILayer";
import { View } from "./View";
import type { ViewContext } from "./views";

export class DebugView extends View {
	private gc: GameContext;
	private vars: Map<string, unknown>;
	private width: number;
	private height: number;
	private ctx: CanvasRenderingContext2D;
	private canvas: HTMLCanvasElement;
	private rezMgr: ResourceManager;
	private spritesheetList: string[];
	private names: string[] = [];
	private spriteIndex = 0;
	private animations: AnimMap | null = null;
	private stepAnim = false;
	private step = 0;
	private spritesheetName = "";
	private spritesheet: SpriteSheet | null = null;
	private sprites: SpriteMap | null = null;
	// private bkgndIndex: number;
	// private pauseAnim: boolean;

	constructor(ctx: ViewContext) {
		super(ctx);

		this.gc = ctx.gc;
		this.vars = ctx.vars;
		this.canvas = ctx.canvas;
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;

		this.vars.set("frameSpriteSize", { x: 0, y: 0 });
		this.vars.set("anim", {
			loopInitialValue: 0,
			len: 0,
			frames: { length: 0 },
		});
		this.vars.set("frameSprite", "");
		this.vars.set("spriteType", "");

		this.rezMgr = this.gc.resourceManager;
		this.spritesheetList = [...this.rezMgr.byKind("sprite"), ...this.rezMgr.byKind("font")];

		// this.bkgndIndex = 0;

		this.buildUI(ctx.layer, this.spritesheetList);

		this.setSpritesheet(0);
	}

	destroy() {}

	buildUI(layer: UILayer, list: string[]) {
		const options = list.map((item, idx) => `<option value="${idx}">${item.replace(/^[^:]+:/, "")}</option>`);
		const html = `
			<div class="vcenter hcenter">
				<div class="grid-column vcenter">
					<div id="btnPrevAnim" class="btn light-shadow">
						<div class="icn z50 icn-up-arrow"></div>Previous
					</div>
					<div id="btnNextAnim" class="btn light-shadow">
						<div class="icn z50 icn-down-arrow"></div>
						Next
					</div>
					<div id="btnPlayAnim" class="btn light-shadow">
					<div class="icn z50 icn-down-play"></div>
						Play
					</div>
				</div>
				<div class="grid-column vcenter">
					<div id="btnPlusAnim" class="btn light-shadow">
						+
					</div>
					<div id="btnMinusAnim" class="btn light-shadow">
						-
					</div>
					<div id="btnStepAnim" class="btn light-shadow">
						S
					</div>
					<div id="btnAAnim" class="btn light-shadow">
						A
					</div>
					<div id="btnZAnim" class="btn light-shadow">
						Z
					</div>
				</div>
			</div>
			<div class="vcenter hcenter">
				<style>
				#SpriteBrowser {
					display: grid;
					grid-template: auto 1fr / 200px 200px;
					grid-gap: 5px;				
				}
				</style>
				<div id="SpriteBrowser">
					<div>GROUP</div><div>SPRITES</div>
					<select id="ss" size="7">${options}</select>
					<select id="ss-items" size="7">${options}</select>
				</div>
			</div>
		`;

		layer.setContent(html, this);
	}

	onClickUIBtn(id: string) {
		switch (id) {
			case "btnPrevAnim":
				this.prevAnim();
				break;
			case "btnNextAnim":
				this.nextAnim();
				break;
			case "btnPlayAnim":
				this.playAnim();
				break;
			case "btnPlusAnim":
				this.plusAnim();
				break;
			case "btnMinusAnim":
				this.minusAnim();
				break;
			case "btnStepAnim":
				this.sAnim();
				break;
			case "btnAAnim":
				this.zAnim();
				break;
			case "btnZAnim":
				this.zAnim();
				break;
		}
	}

	onChangeUI(el: HTMLInputElement | HTMLSelectElement) {
		switch (el.id) {
			// case "bkgndIndex":
			// 	this.setBackground(el.value);
			// 	break;
			case "ss":
				this.setSpritesheet(Number(el.value));
				break;
			case "ss-items":
				this.updateSpriteListUI(el.value);
				break;
		}
	}

	handleEvent(gc: GameContext, e) {
		switch (e.type) {
			case "keydown":
				switch (e.key) {
					case "ArrowDown":
						this.prevAnim();
						break;
					case "ArrowUp":
						this.nextAnim();
						break;
				}
		}
	}

	updateSpriteListUI(name: string) {
		this.spriteIndex = this.names.indexOf(name);
	}

	prevAnim() {
		this.spriteIndex = this.spriteIndex > 0 ? this.spriteIndex - 1 : this.names.length - 1;
		this.vars.set("spriteIndex", this.spriteIndex);
	}

	nextAnim() {
		if (this.spriteIndex < this.names.length - 1) this.spriteIndex++;
		this.vars.set("spriteIndex", this.spriteIndex);
	}
	playAnim() {
		if (!this.animations) return;
		const anim = this.animations.get(this.names[this.spriteIndex]);
		anim?.reset();
	}
	plusAnim() {
		if (!this.animations) return;
		const anim = this.animations.get(this.names[this.spriteIndex]);
		if (!anim) return;
		anim.len = (anim.len * 10 - 1) / 10;
		if (anim.len <= 0) anim.len = 0.1;
	}
	minusAnim() {
		if (!this.animations) return;
		const anim = this.animations.get(this.names[this.spriteIndex]);
		if (!anim) return;
		anim.len = (anim.len * 10 + 1) / 10;
	}
	sAnim() {
		this.stepAnim = !this.stepAnim;
	}
	aAnim() {
		if (!this.animations) return;
		const anim = this.animations.get(this.names[this.spriteIndex]);
		if (!anim) return;
		this.step--;
		if (this.step < 0) this.step = anim.frames.length - 1;
	}
	zAnim() {
		if (!this.animations) return;
		const anim = this.animations.get(this.names[this.spriteIndex]);
		if (!anim) return;
		this.step = (this.step + 1) % anim.frames.length;
	}

	setSpritesheet(idx: number) {
		let spritesheet: SpriteSheet;
		this.spritesheetName = this.spritesheetList[idx];
		if (this.spritesheetName.match(/^font:/)) {
			const font = this.rezMgr.get(this.spritesheetName) as Font;
			spritesheet = font.spritesheet;
		} else {
			spritesheet = this.rezMgr.get(this.spritesheetName) as SpriteSheet;
		}
		this.spritesheet = spritesheet;
		this.animations = spritesheet.animations;
		this.sprites = spritesheet.sprites;
		this.names = [...this.sprites.keys(), ...this.animations.keys()];
		this.vars.set("names", this.names);

		this.spriteIndex = 0;
		this.vars.set("spriteIndex", this.spriteIndex);

		// this.pauseAnim = false;
		this.stepAnim = false;
		this.step = 0;

		const itemList = document.querySelector("#ss-items") as HTMLSelectElement;
		if (itemList) {
			itemList.options.length = 0;
			for (let idx = 0; idx < this.names.length; idx++) {
				const opt = document.createElement("option");
				opt.text = this.names[idx];
				itemList.options.add(opt);
			}
		}
	}

	render(gc: GameContext) {
		const localGc = { ...gc };
		localGc.viewport = createViewport(this.canvas, gc.viewport);
		this.ctx.clearRect(0, 0, this.width, this.height);

		const name = this.names[this.spriteIndex];
		const anim = this.animations?.get(name);
		if (anim) {
			this.vars.set("spriteType", "anim");
			this.vars.set("anim", anim);
			const step = this.stepAnim ? this.step : gc.tick;
			const frameSprite = anim.frame(step);
			this.vars.set("frameSprite", frameSprite);

			if (!this.spritesheet) return;

			const frameSpriteSize = this.spritesheet.spriteSize(frameSprite);
			this.vars.set("frameSpriteSize", frameSpriteSize);
			// this.spritesheet.draw(frameSprite, this.ctx, this.width-frameSpriteSize.x-50, 50);
			// this.spritesheet.draw(
			// 	frameSprite,
			// 	this.ctx,
			// 	this.width / 2 - frameSpriteSize.x,
			// 	this.height / 2 - frameSpriteSize.y,
			// 	{ zoom: 2 },
			// );

			const sprite = this.spritesheet.sprites.get(frameSprite);
			if (!sprite) return;

			const x = this.width / 2 - frameSpriteSize.x;
			const y = this.height / 2 - frameSpriteSize.y;
			drawPixelated(sprite[0], this.ctx, 2, x - frameSpriteSize.x - 5, y);
			drawPixelated(sprite[1], this.ctx, 2, x + frameSpriteSize.x + 5, y);
			return;
		}

		if (this.sprites?.has(name)) {
			if (!this.spritesheet) return;

			this.vars.set("spriteType", "sprite");
			const spriteSize = this.spritesheet.spriteSize(name);
			// this.spritesheet.draw(
			// 	name,
			// 	this.ctx,
			// 	this.width / 2 - spriteSize.x,
			// 	this.height / 2 - spriteSize.y,
			// 	{ zoom: 2 },
			// );
			const sprite = this.spritesheet.sprites.get(name);
			if (!sprite) return;

			const x = this.width / 2 - spriteSize.x;
			const y = this.height / 2 - spriteSize.y;
			drawPixelated(sprite[0], this.ctx, 2, x - spriteSize.x - 5, y);
			drawPixelated(sprite[1], this.ctx, 2, x + spriteSize.x + 5, y);
		}
	}
}
