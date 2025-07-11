import { compile } from "../script/compiler2/compiler";
import type { TSpriteSheet, TSpriteSheetGrid } from "../script/compiler2/rules/ressources/spritesheet.rule";
import { type TImageData, drawZoomedImage } from "../utils/canvas.utils";
import { createSpriteSheet } from "../utils/createSpriteSheet.util";
import { loadImage, loadText } from "../utils/loaders.util";
import type { Rect } from "../utils/maths/math";
import { Anim } from "./Anim";

export type SpriteMap = Map<string, Sprite>;
export type AnimMap = Map<string, Anim>;

type TDefineOptions = {
	gridSize?: TSpriteSheetGrid["size"];
	scale?: number;
};

class Sprite {
	public imgs: [HTMLCanvasElement, HTMLCanvasElement];
	public width = 0;
	public height = 0;

	constructor(
		public bounds: Rect,
		public scale = 1,
	) {
		this.imgs = [document.createElement("canvas"), document.createElement("canvas")];
	}
}

export class SpriteSheet {
	static wannaLog = false;

	public animations: AnimMap;
	public sprites: SpriteMap;
	public name: string;

	readonly img: HTMLImageElement | HTMLCanvasElement;
	private data: TImageData;

	static loadScript(filename: string) {
		return loadText(filename)
			.then((script) => compile<TSpriteSheet>(script, "spritesheet")) //; compileSpriteSheetScript(filename, script))
			.then((sheet) => SpriteSheet.loadData(sheet));
	}

	static loadData(sheet: TSpriteSheet) {
		return loadImage(sheet.image).then((img) => {
			if (SpriteSheet.wannaLog) console.log("createSpriteSheet", sheet.name);
			return createSpriteSheet(sheet, img);
		});
	}

	constructor(name: string, img: HTMLImageElement | HTMLCanvasElement) {
		this.img = img;
		this.name = name;

		const canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;

		const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(img, 0, 0);

		this.data = {
			imgData: ctx.getImageData(0, 0, img.width, img.height).data,
			width: img.width,
		};

		this.sprites = new Map();
		this.animations = new Map();
	}

	[Symbol.for("inspect")]() {
		return `${this.name} sprites:${this.sprites.size} animations:${this.animations.size}`;
	}

	define(name: string, r: Rect, { gridSize, scale }: TDefineOptions = {}) {
		scale = scale ?? 1;
		gridSize = gridSize ?? [1, 1];
		const sprite = new Sprite(r, scale);

		[false, true].map((flip) => {
			const canvas = sprite.imgs[flip ? 1 : 0];
			const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
			ctx.imageSmoothingEnabled = false;

			const srcWidth = r.width * scale;
			const srcHeight = r.height * scale;
			let destWidth = srcWidth;
			let destHeight = srcHeight;

			let destX = 0;
			if (r.width < gridSize[0]) {
				const dx = gridSize[0] - r.width;
				destX = Math.floor(dx / 2);
				destWidth = gridSize[0] * scale;
			}

			let destY = 0;
			if (r.height < gridSize[1]) {
				const dy = gridSize[1] - r.height;
				destY = Math.floor(dy / 2);
				destHeight = gridSize[1] * scale;
			}

			// console.log(name, destX, destY, gridSize[0], r.width);
			canvas.width = destWidth;
			canvas.height = destHeight;

			if (flip) {
				ctx.scale(-1, 1);
				ctx.translate(-r.width * scale, 0);
			}

			if (scale > 1)
				drawZoomedImage(
					this.data,
					ctx,
					scale,
					{
						x: r.x,
						y: r.y,
						w: srcWidth,
						h: srcHeight,
					},
					destX,
					destY,
				);
			else {
				ctx.scale(Math.abs(scale), Math.abs(scale));
				ctx.drawImage(this.img, r.x, r.y, r.width, r.height, destX, destY, r.width, r.height);
			}
		});

		sprite.width = sprite.imgs[0].width;
		sprite.height = sprite.imgs[0].height;

		this.sprites.set(name, sprite);
	}

	// TODO: fix with Sprite
	defineComplex(_name: string, spriteDef) {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
		ctx.imageSmoothingEnabled = false;

		{
			let width = 0;
			let height = 0;
			for (let idx = 0; idx < spriteDef.length; idx++) {
				const [[col, row, countX, countY], name] = spriteDef[idx];
				if (name) {
					const s = this.spriteSize(name);
					if (countY) height += s.height * countY;
					if (countX) width += s.width * countX;
					if (width < s.width) width = s.width;
					if (height < s.height) height = s.height;
				} else {
					height += row;
					width += col;
				}
			}

			canvas.width = width;
			canvas.height = height;
		}

		let width = 0;
		let height = 0;
		let dx = 0;
		let dy = 0;

		for (let idx = 0; idx < spriteDef.length; idx++) {
			const [[col, row, countX, countY], name] = spriteDef[idx];
			let spriteSize = { width: 0, height: 0 };
			if (name) {
				spriteSize = this.spriteSize(name);
				if (countY) {
					dy = height;
					height += spriteSize.height * countY;
				}
				if (countX) {
					dx = width;
					width += spriteSize.width * countX;
				}
				if (width < spriteSize.width) width = spriteSize.width;
				if (height < spriteSize.height) height = spriteSize.height;
			} else {
				height += row;
				width += col;
				continue;
			}

			const sprites = this.sprites.get(name);
			if (!sprites) continue;

			if (countY > 1) {
				for (let idx = 0; idx < countY; idx++) {
					ctx.drawImage(sprites[0], 0, 0, spriteSize.width, spriteSize.height, dx, dy, spriteSize.width, spriteSize.height);
					dy += spriteSize.height;
				}
			} else if (countX > 1) {
				for (let idx = 0; idx < countX; idx++) {
					ctx.drawImage(sprites[0], 0, 0, spriteSize.width, spriteSize.height, dx, dy, spriteSize.width, spriteSize.height);
					dx += spriteSize.width;
				}
			} else ctx.drawImage(sprites[0], 0, 0, spriteSize.width, spriteSize.height, dx, dy, spriteSize.width, spriteSize.height);
		}

		// this.sprites.set(name, [canvas]);
	}

	defineAnim(name: string, sheet) {
		this.animations.set(name, new Anim(name, sheet));
	}

	has(name: string) {
		return this.sprites.has(name);
	}

	hasAnim(name: string) {
		return this.animations.has(name);
	}

	spriteSize(name: string) {
		const sprite = this.sprites.get(name);
		if (!sprite) throw new Error(`Unable to find sprite "${name}"`);
		return { width: sprite.width, height: sprite.height };
	}

	draw(name: string, ctx: CanvasRenderingContext2D, x: number, y: number, { flip, zoom } = { flip: 0, zoom: 1 }) {
		const sprite = this.sprites.get(name);
		if (!sprite) throw new Error(`Unable to find sprite "${name}"`);
		const img = sprite.imgs[flip | 0];
		ctx.drawImage(img, x, y, zoom * img.width, zoom * img.height);
	}

	drawAnim(name: string, ctx: CanvasRenderingContext2D, x: number, y: number, distance: number, { zoom } = { zoom: 1 }) {
		const animation = this.animations.get(name);
		if (animation) this.draw(animation.frame(distance), ctx, x, y, { flip: 0, zoom });
	}
}
