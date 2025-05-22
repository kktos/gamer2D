import type { Font } from "gamer2d/game/Font";
import { SpriteSheet } from "gamer2d/game/Spritesheet";
import type { GameContext } from "gamer2d/game/types/GameContext";
import { View } from "gamer2d/layers/display/views/View";
import type { ViewContext } from "gamer2d/layers/display/views/View.factory";
import type { BBox } from "gamer2d/maths/BBox.class";
import type { TAnimation } from "gamer2d/script/compiler/ressources/spritesheet.rules";
import { addDefsToSpriteSheet } from "gamer2d/utils/createSpriteSheet.util";
import { selectedAnim } from "../shared/main.store.js";
import { Signal } from "../shared/signal.class.js";
import { CanvasHorizontalScrollbar } from "./components/hscrollbar.component.js";
import { SpriteItemList, SpritesView } from "./components/spritesView.component.js";
import { buildSpritesheetFile } from "./utils/generateSpritesheet.util.js";

interface Component {
	bounds: BBox;
	render(ctx: CanvasRenderingContext2D): void;
	handleEvent(gc: GameContext, e: Event): boolean;
}

const ANIMS_YPOS_START = 85;

export class SpritesheetViewerView extends View {
	static EVENT_SPRITE_SELECTED = Symbol.for("SPRITE_SELECTED");

	private _spritesheet = Signal.create<SpriteSheet>();
	private selectedSprites = Signal.create<Set<string>>();
	private font: Font;
	private imagePath = "";

	private components: Map<string, Component> = new Map();

	constructor(ctx: ViewContext) {
		super(ctx);
		const rsrcMngr = ctx.gc.resourceManager;
		this.font = rsrcMngr.get("font", rsrcMngr.mainFontName);
		this.font.size = 1;

		const selectedSprite = Signal.create<string>();
		selectedSprite.subscribe((name) => {
			this.layer.scene.emit(SpritesheetViewerView.EVENT_SPRITE_SELECTED, name);
		});

		// this.selectedSprites.subscribe((names) => {
		// this.layer.scene.emit(SpritesheetViewerView.EVENT_SPRITE_SELECTED, name);
		// });

		let bounds = { x: 0, y: 0, width: this.canvas.width, height: ANIMS_YPOS_START };
		const sprites = new SpritesView({
			gc: ctx.gc,
			title: "Sprites",
			bounds,
			selected: selectedSprite,
			selectedList: this.selectedSprites,
		});

		this._spritesheet.subscribe((spritesheet) => {
			if (spritesheet) {
				const list = new SpriteItemList();
				list.getImage = (name: string) => spritesheet.sprites.get(name)?.[0] ?? undefined;
				spritesheet.sprites.forEach((sprite, name) => list.add(name, sprite[0]));
				sprites.list = list;
			}
		});

		this.components.set("sprites", sprites);

		bounds = { x: 0, y: ANIMS_YPOS_START, width: this.canvas.width, height: this.canvas.height - ANIMS_YPOS_START };
		const anims = new SpritesView({
			gc: ctx.gc,
			title: "Animations",
			bounds,
			selected: Signal.create<string>(),
			selectedList: this.selectedSprites,
		});
		anims.selected.subscribe((name) => {
			if (!name) return;
			const anim = this._spritesheet.value?.animations.get(name);
			if (!anim) return;
			selectedAnim.value = { name, anim };
		});

		this._spritesheet.subscribe((spritesheet) => {
			if (spritesheet) {
				const list = new SpriteItemList();

				list.getImage = (name: string, tick: number) => {
					const sprite = spritesheet.animations.get(name)?.frame(tick);
					if (!sprite) return undefined;
					return spritesheet.sprites.get(sprite)?.[0] ?? undefined;
				};

				spritesheet.animations.forEach((anim, name) => {
					const sprite = spritesheet.sprites.get(anim.frame(0));
					if (!sprite) return;
					list.add(name, sprite[0]);
				});
				anims.list = list;
			}
		});

		this.components.set("anims", anims);

		CanvasHorizontalScrollbar.trackColor = "rgba(255 255 255 / 20%)";
		CanvasHorizontalScrollbar.thumbColor = "rgba(255 255 255 / 20%)";
		CanvasHorizontalScrollbar.thumbHoverColor = "rgba(255 255 255 / 80%)";
		CanvasHorizontalScrollbar.thumbDragColor = "rgba(200 200 255 / 80%)";
		CanvasHorizontalScrollbar.thumbBorderColor = "rgba(255 255 255 / 20%)";
	}

	public destroy() {}

	public set spritesheet({ ss, image }: { ss: SpriteSheet; image: string }) {
		if (!(ss instanceof SpriteSheet)) throw new TypeError("Invalid spritesheet");
		this._spritesheet.value = ss;
		this.imagePath = image;
	}

	public handleEvent(gc, e): void {
		for (const [_, comp] of this.components) {
			const localEvent = { ...e };
			localEvent.x = e.x - comp.bounds.left;
			localEvent.y = e.y - comp.bounds.top;
			if (comp.handleEvent(gc, localEvent)) return;
		}

		switch (e.type) {
			case "keyup":
				if (e.key === "+") {
				}
				break;
		}
	}

	public createAnim(options) {
		if (!this._spritesheet.value || !this.selectedSprites.value || this.selectedSprites.value.size < 2) return;

		let animSheet: TAnimation;
		const anim = this._spritesheet.value.animations.get(options.name);
		if (anim) {
			console.log("exists", anim);
			animSheet = {
				frames: anim.frames,
				length: options.length,
				loop: options.loop,
			};
		} else {
			console.log("new");
			animSheet = {
				frames: Array.from(this.selectedSprites.value),
				length: options.length,
				loop: options.loop,
			};
		}

		console.log("defineAnim", options.name, animSheet);
		this._spritesheet.value.defineAnim(options.name, animSheet);
		this._spritesheet.notify();
	}

	public createSprite(sheet) {
		if (!this._spritesheet.value) return;
		addDefsToSpriteSheet({ sprites: sheet }, this._spritesheet.value);
		this._spritesheet.notify();
	}

	public generateSpritesheet() {
		if (!this._spritesheet.value) return;
		buildSpritesheetFile(this._spritesheet.value, this.imagePath);
	}

	public render(gc: GameContext) {
		this.ctx.fillStyle = "black";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		if (this._spritesheet) for (const [name, comp] of this.components) comp.render(this.ctx);
	}
}
