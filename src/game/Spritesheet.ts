import ENV from "../env";
import type { TSpritesSheet } from "../types/engine.types";
import { drawZoomedImage } from "../utils/canvas.utils";
import createSpriteSheet from "../utils/createSpriteSheet.util";
import { loadImage, loadJson } from "../utils/loaders.util";
import Anim from "./Anim";

export type SpriteMap = Map<string, HTMLCanvasElement[]>;
export type AnimMap = Map<string, Anim>;

export class SpriteSheet {
	public animations: AnimMap;
	public sprites: SpriteMap;

	private img: HTMLImageElement;
	private data: { imgData: Uint8ClampedArray<ArrayBufferLike>; width: number };

	static load(filename: string) {
		let sheet: TSpritesSheet;
		return loadJson(ENV.SPRITESHEETS_PATH + filename)
			.then((s) => {
				sheet = s;
			})
			.then(() => loadImage(sheet.img))
			.then((img) => createSpriteSheet(sheet, img));
	}

	constructor(img: HTMLImageElement) {
		this.img = img;

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

	define(name: string, x: number, y: number, w: number, h: number, { scale = 1 } = {}) {
		const sprites = [false, true].map((flip) => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
			ctx.imageSmoothingEnabled = false;

			canvas.width = w * scale;
			canvas.height = h * scale;

			if (flip) {
				ctx.scale(-1, 1);
				ctx.translate(-w * scale, 0);
			}

			if (scale) {
				drawZoomedImage(this.data, ctx, scale, {
					x,
					y,
					w: canvas.width,
					h: canvas.height,
				});
			} else {
				ctx.drawImage(this.img, x, y, w, h, 0, 0, w, h);
			}

			return canvas;
		});
		this.sprites.set(name, sprites);
	}

	defineComplex(name: string, spriteDef) {
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
		ctx.imageSmoothingEnabled = false;

		{
			let width = 0;
			let height = 0;
			// spriteDef.forEach(([offsets, name]) => {
			for (let idx = 0; idx < spriteDef.length; idx++) {
				const [[col, row, countX, countY], name] = spriteDef[idx];
				// const [col, row, countX, countY]= offsets;
				if (name) {
					const s = this.spriteSize(name);
					if (countY) height += s.y * countY;
					if (countX) width += s.x * countX;
					if (width < s.x) width = s.x;
					if (height < s.y) height = s.y;
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

		// spriteDef.forEach(([offsets, name]) => {
		// 	const [col, row, countX, countY]= offsets;
		for (let idx = 0; idx < spriteDef.length; idx++) {
			const [[col, row, countX, countY], name] = spriteDef[idx];
			let spriteSize = { x: 0, y: 0 };
			if (name) {
				spriteSize = this.spriteSize(name);
				if (countY) {
					dy = height;
					height += spriteSize.y * countY;
				}
				if (countX) {
					dx = width;
					width += spriteSize.x * countX;
				}
				if (width < spriteSize.x) width = spriteSize.x;
				if (height < spriteSize.y) height = spriteSize.y;
			} else {
				height += row;
				width += col;
				continue;
			}

			const sprites = this.sprites.get(name);
			if (!sprites) continue;

			if (countY > 1) {
				for (let idx = 0; idx < countY; idx++) {
					ctx.drawImage(sprites[0], 0, 0, spriteSize.x, spriteSize.y, dx, dy, spriteSize.x, spriteSize.y);
					dy += spriteSize.y;
				}
			} else if (countX > 1) {
				for (let idx = 0; idx < countX; idx++) {
					ctx.drawImage(sprites[0], 0, 0, spriteSize.x, spriteSize.y, dx, dy, spriteSize.x, spriteSize.y);
					dx += spriteSize.x;
				}
			} else ctx.drawImage(sprites[0], 0, 0, spriteSize.x, spriteSize.y, dx, dy, spriteSize.x, spriteSize.y);
		}

		this.sprites.set(name, [canvas]);
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
		const sprites = this.sprites.get(name);
		if (!sprites) {
			throw new Error(`Unable to find sprite "${name}"`);
		}
		const sprite = sprites[0];
		return { x: sprite.width, y: sprite.height };
	}

	draw(name: string, ctx: CanvasRenderingContext2D, x: number, y: number, { flip, zoom } = { flip: 0, zoom: 1 }) {
		const spritePair = this.sprites.get(name);
		if (!spritePair) throw new Error(`Unable to find sprite "${name}"`);
		const sprite = spritePair[flip | 0];
		ctx.drawImage(sprite, x, y, (zoom ?? 1) * sprite.width, zoom * sprite.height);
		// ctx.strokeStyle="red";
		// ctx.strokeRect(x,y, zoom*sprite.width, zoom*sprite.height);
	}

	drawAnim(name: string, ctx: CanvasRenderingContext2D, x: number, y: number, distance: number, { zoom } = { zoom: 1 }) {
		const animation = this.animations.get(name);
		if (animation) this.draw(animation.frame(distance), ctx, x, y, { flip: 0, zoom });
	}
}
