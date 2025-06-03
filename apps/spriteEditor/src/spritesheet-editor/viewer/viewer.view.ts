import type { Font } from "gamer2d/game/Font";
import { SpriteSheet } from "gamer2d/game/Spritesheet";
import type { GameContext } from "gamer2d/game/types/GameContext";
import type { BaseEvent } from "gamer2d/game/types/GameEvent";
import { View } from "gamer2d/layers/display/views/View";
import type { ViewContext } from "gamer2d/layers/display/views/View.factory";
import type { BBox } from "gamer2d/maths/BBox.class";
import type { TAnimation } from "gamer2d/script/compiler/ressources/spritesheet.rules";
import { addDefsToSpriteSheet } from "gamer2d/utils/createSpriteSheet.util";
import { selectedAnim, selectedSprite, selectedSprites, spritesheetSourceText } from "../shared/main.store.js";
import { Signal } from "../shared/signal.class.js";
import { CanvasHorizontalScrollbar } from "./components/hscrollbar.component.js";
import { SpriteItemList } from "./components/spriteitemlist.class.js";
import { SpritesView } from "./components/spritesView.component.js";
import { buildSpritesheetFile } from "./utils/generateSpritesheet.util.js";

interface Component {
	bounds: BBox;
	render(ctx: CanvasRenderingContext2D): void;
	handleEvent(gc: GameContext, e: BaseEvent): boolean;
}

const ANIMS_YPOS_START = 85;

export class SpritesheetViewerView extends View {
	static EVENT_SPRITE_SELECTED = Symbol.for("SPRITE_SELECTED");

	private _spritesheet = Signal.create<SpriteSheet>();
	private font: Font;
	private imagePath = "";

	private components: Map<string, Component> = new Map();

	constructor(ctx: ViewContext) {
		super(ctx);
		const rsrcMngr = ctx.gc.resourceManager;
		this.font = rsrcMngr.get("font", rsrcMngr.mainFontName);
		this.font.size = 1;

		this.createComponents();

		this.layer.scene.on(SpritesView.EVENT_DELETE_ITEMS, (name, spritesToDelete) => {
			switch (name) {
				case "sprite":
					return this.deleteSprites(spritesToDelete as string[]);
				case "anim":
					return this.deleteAnims(spritesToDelete as string[]);
			}
		});

		CanvasHorizontalScrollbar.trackColor = "rgba(255 255 255 / 20%)";
		CanvasHorizontalScrollbar.thumbColor = "rgba(255 255 255 / 20%)";
		CanvasHorizontalScrollbar.thumbHoverColor = "rgba(255 255 255 / 80%)";
		CanvasHorizontalScrollbar.thumbDragColor = "rgba(200 200 255 / 80%)";
		CanvasHorizontalScrollbar.thumbBorderColor = "rgba(255 255 255 / 20%)";
	}

	private createComponents() {
		selectedSprite.subscribe((name) => {
			this.layer.scene.emit(SpritesheetViewerView.EVENT_SPRITE_SELECTED, name);
		});

		// this.selectedSprites.subscribe((names) => {
		// this.layer.scene.emit(SpritesheetViewerView.EVENT_SPRITE_SELECTED, name);
		// });

		let bounds = { x: 0, y: 0, width: this.canvas.width, height: ANIMS_YPOS_START };
		const sprites = new SpritesView({
			gc: this.gc,
			title: "Sprites",
			bounds,
			selected: selectedSprite,
			selectedList: selectedSprites,
		});

		this._spritesheet.subscribe((spritesheet) => {
			if (spritesheet) {
				const list = new SpriteItemList("sprite");
				list.getImage = (name: string) => spritesheet.sprites.get(name)?.imgs[0] ?? undefined;
				spritesheet.sprites.forEach((sprite, name) => list.add(name, sprite));
				sprites.list = list;
			}
		});

		this.components.set("sprites", sprites);

		bounds = { x: 0, y: ANIMS_YPOS_START, width: this.canvas.width, height: this.canvas.height - ANIMS_YPOS_START };
		const anims = new SpritesView({
			gc: this.gc,
			title: "Animations",
			bounds,
			selected: Signal.create<string>(),
			selectedList: Signal.create<Set<string>>(),
		});
		anims.selected.subscribe((name) => this.selectAnim(name));

		this._spritesheet.subscribe((spritesheet) => {
			if (spritesheet) {
				const list = new SpriteItemList("anim");

				list.getImage = (name: string, tick: number) => {
					const sprite = spritesheet.animations.get(name)?.frame(tick);
					if (!sprite) return undefined;
					return spritesheet.sprites.get(sprite)?.imgs[0] ?? undefined;
				};

				spritesheet.animations.forEach((anim, name) => {
					const sprite = spritesheet.sprites.get(anim.frame(0));
					if (!sprite) return;
					list.add(name, sprite);
				});
				anims.list = list;
			}
		});

		this.components.set("anims", anims);
	}

	public destroy() {}

	public set spritesheet({ ss, image }: { ss: SpriteSheet; image: string }) {
		if (!(ss instanceof SpriteSheet)) throw new TypeError("Invalid spritesheet");
		this._spritesheet.value = ss;
		this.imagePath = image;
	}

	public handleEvent(gc: GameContext, e: BaseEvent): void {
		for (const [_, comp] of this.components) {
			const localEvent = { ...e };
			localEvent.x = e.x - comp.bounds.left;
			localEvent.y = e.y - comp.bounds.top;
			if (comp.handleEvent(gc, localEvent)) return;
		}
	}

	private selectAnim(name: string | undefined) {
		if (!name) return;
		const anim = this._spritesheet.value?.animations.get(name);
		if (!anim) return;
		selectedAnim.value = { name, anim };

		const sprites = this.components.get("sprites") as SpritesView;
		sprites.selectedNameList = new Set(anim.frames);
		selectedSprites.value = new Set(anim.frames);
	}

	public createAnim(options) {
		// if (!this._spritesheet.value || !this.selectedSprites.value || this.selectedSprites.value.size < 2) return;
		if (!this._spritesheet.value || !selectedSprites.value) return;

		let animSheet: TAnimation;
		const anim = this._spritesheet.value.animations.get(options.name);
		if (anim) {
			animSheet = {
				frames: anim.frames,
				length: options.length,
				loop: options.loop,
			};
		} else {
			animSheet = {
				frames: Array.from(selectedSprites.value),
				length: options.length,
				loop: options.loop,
			};
		}

		this._spritesheet.value.defineAnim(options.name, animSheet);
		this._spritesheet.notify();
	}

	public createSprite(sheet) {
		if (!this._spritesheet.value) return;
		addDefsToSpriteSheet({ sprites: sheet }, this._spritesheet.value);
		this._spritesheet.notify();
	}

	public renameSprite(newName: string) {
		console.log("renameSprite");
		if (!this._spritesheet.value || !selectedSprites.value) return;

		const sprites = this._spritesheet.value.sprites;
		let idx = 0;
		for (const name of selectedSprites.value) {
			const sprite = sprites.get(name);
			if (sprite) {
				sprites.delete(name);
				const nameIdx = `${newName}-${idx}`;
				console.log(nameIdx);
				sprites.set(nameIdx, sprite);
			}
			idx++;
		}
		this._spritesheet.notify();
	}

	private deleteSprites(list: string[]) {
		if (!this._spritesheet.value) return;
		const sprites = this._spritesheet.value.sprites;
		for (const name of list) sprites.delete(name);
		this._spritesheet.notify();
	}

	private deleteAnims(list: string[]) {
		if (!this._spritesheet.value) return;
		const animations = this._spritesheet.value.animations;
		for (const name of list) animations.delete(name);
		this._spritesheet.notify();
	}

	public generateSpritesheet() {
		if (!this._spritesheet.value) return;
		const script = buildSpritesheetFile(this._spritesheet.value, this.imagePath);
		spritesheetSourceText.value = script;
	}

	public render(gc: GameContext) {
		this.ctx.fillStyle = "black";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		if (this._spritesheet) for (const [name, comp] of this.components) comp.render(this.ctx);
	}
}
