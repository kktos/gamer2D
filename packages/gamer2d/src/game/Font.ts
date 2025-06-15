import { BBox } from "../maths/BBox.class";
import { ALIGN_TYPES, type TAlignType } from "../script/compiler2/types/align.type";
import type { RequireAllOrNone } from "../types/typescript.types";
import { nameToRgba } from "../utils/canvas.utils";
import { loadImage, loadJson } from "../utils/loaders.util";
import { SpriteSheet } from "./Spritesheet";

// const CHARS= ' 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ©!-×.';

export type TFontSheet = {
	name: string;
	height: number;
	width: number;
	charset: string;
	img: string;
	offsetX: number;
	offsetY: number;
	gapX: number;
	gapY: number;
	hasLowercase: boolean;
};

type TPrintOptionsBase = {
	ctx: CanvasRenderingContext2D;
	text: string;
	x: number;
	y: number;
	color?: string;
	bgcolor?: string;
	isDynamic?: boolean;
	width: number;
	height: number;
};
export type PrintOptions = RequireAllOrNone<TPrintOptionsBase, "width" | "height">;

export function loadFontData(sheetDef: TFontSheet) {
	return loadImage(sheetDef.img)
		.then((image) => {
			const spritesheet = new SpriteSheet(sheetDef.name, image);
			const offsetX = sheetDef.offsetX;
			const offsetY = sheetDef.offsetY;
			const charWidth = sheetDef.width + sheetDef.gapX;
			const charHeight = sheetDef.height + sheetDef.gapY;
			const charsPerLine = (image.width - offsetX) / charWidth;
			for (const [index, char] of [...sheetDef.charset].entries()) {
				const x = offsetX + (index % charsPerLine) * charWidth;
				const y = offsetY + Math.floor(index / charsPerLine) * charHeight;
				spritesheet.define(char, { x, y, width: sheetDef.width, height: sheetDef.height });
			}
			return new Font(sheetDef.name, spritesheet, sheetDef.height, sheetDef.width, sheetDef.hasLowercase);
		})
		.catch((err) => console.error("loadImage", sheetDef.img, err));
}

export class Font {
	public name: string;
	public size: number;
	public align: TAlignType;
	public valign: TAlignType;
	public spritesheet: SpriteSheet;
	public hasLowercase: boolean;
	public color!: string;
	public bgcolor!: string;

	private spriteHeight: number;
	private spriteWidth: number;
	private cache: Map<string, HTMLCanvasElement>;

	static fonts: Map<string, Font> = new Map();

	static async load(filename: string) {
		const sheet = (await loadJson(filename)) as TFontSheet;
		return loadFontData(sheet);
	}

	constructor(name: string, spritesheet: SpriteSheet, height: number, width: number, hasLowercase = false) {
		this.name = name;
		this.spritesheet = spritesheet;
		this.spriteHeight = height;
		this.spriteWidth = width;
		this.size = 1;
		this.align = ALIGN_TYPES.LEFT;
		this.valign = ALIGN_TYPES.TOP;
		this.cache = new Map();
		this.hasLowercase = hasLowercase;

		Font.fonts.set(name, this);
	}

	[Symbol.for("inspect")]() {
		return `${this.name} ${this.spriteHeight}x${this.spriteWidth} cached:${this.cache.size}`;
	}

	get height() {
		return this.spriteHeight * this.size;
	}
	get width() {
		return this.spriteWidth * this.size;
	}

	textRect(text: string, x: number, y: number) {
		const textLen = String(text).toUpperCase().length;
		const width = textLen * this.width;
		let newX = x;
		switch (this.align) {
			case ALIGN_TYPES.CENTER:
				newX -= width / 2;
				break;
			case ALIGN_TYPES.RIGHT:
				newX -= width;
				break;
		}
		return [newX, y, newX + width, y + this.height];
	}

	print(options: PrintOptions): BBox {
		const { ctx, text, x, y, color, width, height, bgcolor, isDynamic } = options;

		if (text === undefined || text === null || text === "") return new BBox(x, y, 0, 0);

		const textColor = color ?? this.color ?? "white";
		const key = JSON.stringify([text, x, y, textColor]);
		let canvas: HTMLCanvasElement | undefined;
		if (isDynamic || !this.cache.has(key)) {
			canvas = document.createElement("canvas");
			const str = this.hasLowercase ? String(text) : String(text).toUpperCase();

			canvas.width = str.length * this.width;
			canvas.height = this.height;

			const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
			ctx.imageSmoothingEnabled = false;

			[...str].forEach((char, pos) => {
				this.spritesheet.draw(char, ctx, pos * this.width, 0, { flip: 0, zoom: this.size });
			});

			// if(color) {
			//     ctx.globalCompositeOperation= "source-in";
			//     ctx.fillStyle= color;
			//     ctx.fillRect(0, 0, canvas.width, canvas.height);
			// }

			if (textColor !== "white") {
				const [r, g, b, a = 255] = nameToRgba(textColor);
				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				const data = imageData.data;
				for (let i = 0; i < data.length; i += 4) {
					if (data[i] === 255 && data[i] === 255 && data[i + 2] === 255) {
						data[i] = r;
						data[i + 1] = g;
						data[i + 2] = b;
						data[i + 3] = a;
					} else data[i + 3] = 0;
				}
				ctx.putImageData(imageData, 0, 0);
			}

			if (!isDynamic) this.cache.set(key, canvas);
		}

		if (!isDynamic) canvas = this.cache.get(key);
		if (!canvas) return new BBox(x, y, 0, 0);

		let newX = 0;
		let newY = 0;
		switch (this.align) {
			case ALIGN_TYPES.CENTER:
				newX -= canvas.width / 2;
				break;
			case ALIGN_TYPES.RIGHT:
				newX -= canvas.width;
				break;
		}
		switch (this.valign) {
			case ALIGN_TYPES.CENTER:
				newY -= canvas.height / 2;
				break;
			case ALIGN_TYPES.BOTTOM:
				newY -= canvas.height;
				break;
		}

		if (width) {
			switch (this.align) {
				case ALIGN_TYPES.CENTER:
					newX += width / 2;
					break;
				case ALIGN_TYPES.RIGHT:
					newX += width;
					break;
			}
			switch (this.valign) {
				case ALIGN_TYPES.CENTER:
					newY += height / 2;
					break;
				case ALIGN_TYPES.BOTTOM:
					newY += height;
					break;
			}
			ctx.fillStyle = bgcolor ?? this.bgcolor ?? "transparent";
			ctx.fillRect(x, y, width, height);
		}

		ctx.drawImage(canvas, x + newX, y + newY);
		return new BBox(x + newX, y + newY, canvas.width, canvas.height);
	}
}
