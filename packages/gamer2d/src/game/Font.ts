import { compile } from "../script/compiler2/compiler";
import type { TFontSheet } from "../script/compiler2/rules/ressources/font.rule";
import { ALIGN_TYPES, type TAlignType } from "../script/compiler2/types/align.type";
import type { RequireAllOrNone } from "../types/typescript.types";
import { nameToRgba } from "../utils/canvas.utils";
import { loadImage, loadText } from "../utils/loaders.util";
import { BBox } from "../utils/maths/BBox.class";
import { SpriteSheet } from "./Spritesheet";

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

function hasLowercase(charset: string): boolean {
	return /[a-z]/.test(charset);
}

export function loadFontData(sheetDef: TFontSheet) {
	return loadImage(sheetDef.image)
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
			return new Font(sheetDef.name, spritesheet, sheetDef.height, sheetDef.width, hasLowercase(sheetDef.charset), sheetDef.isMulticolor);
		})
		.catch((err) => console.error("loadImage", sheetDef.image, err));
}

const fonts: Map<string, Font> = new Map();
let mainFont = "";

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

	private applyColor: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, color: string) => void;

	static async load(filename: string) {
		const script = await loadText(filename);
		const sheet = compile<TFontSheet>(script, "fontsheet");
		return loadFontData(sheet);
	}

	static setMainFont(name: string) {
		mainFont = name;
	}

	static get(name?: string) {
		return fonts.get(name ?? mainFont) as Font;
	}

	constructor(name: string, spritesheet: SpriteSheet, height: number, width: number, hasLowercase: boolean, isMulticolor: boolean) {
		this.name = name;
		this.spritesheet = spritesheet;
		this.spriteHeight = height;
		this.spriteWidth = width;
		this.size = 1;
		this.align = ALIGN_TYPES.LEFT;
		this.valign = ALIGN_TYPES.TOP;
		this.cache = new Map();
		this.hasLowercase = hasLowercase;

		if (isMulticolor) this.applyColor = this.applyColorTransform.bind(this);
		else this.applyColor = this.applyColorTransformFast.bind(this);

		fonts.set(name, this);
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

	print_old(options: PrintOptions): BBox {
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

		if (width && height) {
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

	print(options: PrintOptions): BBox {
		const { ctx, text, x, y, color, width, height, bgcolor, isDynamic } = options;

		// Early return for empty text
		if (!text) return new BBox(x, y, 0, 0);

		const textColor = color ?? this.color ?? "white";

		// More efficient cache key - avoid JSON.stringify
		const cacheKey = `${text}|${textColor}`;
		let canvas: HTMLCanvasElement | undefined;

		if (isDynamic || !this.cache.has(cacheKey)) {
			canvas = this.createTextCanvas(String(text), textColor);
			if (!isDynamic) this.cache.set(cacheKey, canvas);
		} else {
			canvas = this.cache.get(cacheKey);
		}

		if (!canvas) return new BBox(x, y, 0, 0);

		// Calculate alignment offsets
		const alignOffset = this.calculateAlignmentOffset(canvas, width, height);
		const finalX = x + alignOffset.x;
		const finalY = y + alignOffset.y;

		// Draw background if specified
		if (width && height && bgcolor) {
			ctx.fillStyle = bgcolor;
			ctx.fillRect(x, y, width, height);
		}

		// Draw the text canvas
		ctx.drawImage(canvas, finalX, finalY);
		return new BBox(finalX, finalY, canvas.width, canvas.height);
	}

	private createTextCanvas(text: string, textColor: string): HTMLCanvasElement {
		const canvas = document.createElement("canvas");
		const str = this.hasLowercase ? text : text.toUpperCase();

		canvas.width = str.length * this.width;
		canvas.height = this.height;

		const canvasCtx = canvas.getContext("2d") as CanvasRenderingContext2D;
		canvasCtx.imageSmoothingEnabled = false;

		// Draw sprites
		[...str].forEach((char, pos) => {
			this.spritesheet.draw(char, canvasCtx, pos * this.width, 0, {
				flip: 0,
				zoom: this.size,
			});
		});

		// Apply color transformation if needed
		if (textColor !== "white") this.applyColor(canvasCtx, canvas, textColor);

		return canvas;
	}

	private applyColorTransform(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, color: string): void {
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const data = imageData.data;

		// Parse target color
		const targetColor = nameToRgba(color);
		const whiteThreshold = 200;

		for (let i = 0; i < data.length; i += 4) {
			const r = data[i];
			const g = data[i + 1];
			const b = data[i + 2];
			const a = data[i + 3];

			// Check if pixel is white-ish and not transparent
			if (r > whiteThreshold && g > whiteThreshold && b > whiteThreshold && a > 0) {
				data[i] = targetColor[0];
				data[i + 1] = targetColor[1];
				data[i + 2] = targetColor[2];
			}
		}

		ctx.putImageData(imageData, 0, 0);
	}

	private calculateAlignmentOffset(canvas: HTMLCanvasElement, boxWidth?: number, boxHeight?: number): { x: number; y: number } {
		let offsetX = 0;
		// to compensate real font height... TODO: in font definition ?
		let offsetY = 2;

		// Text alignment relative to its own dimensions
		switch (this.align) {
			case ALIGN_TYPES.CENTER:
				offsetX -= canvas.width / 2;
				break;
			case ALIGN_TYPES.RIGHT:
				offsetX -= canvas.width;
				break;
			// LEFT is default (no offset needed)
		}

		switch (this.valign) {
			case ALIGN_TYPES.CENTER:
				offsetY -= canvas.height / 2;
				break;
			case ALIGN_TYPES.BOTTOM:
				offsetY -= canvas.height;
				break;
			// TOP is default (no offset needed)
		}

		// Box alignment adjustments
		if (boxWidth && boxHeight) {
			switch (this.align) {
				case ALIGN_TYPES.CENTER:
					offsetX += boxWidth / 2;
					break;
				case ALIGN_TYPES.RIGHT:
					offsetX += boxWidth;
					break;
			}

			switch (this.valign) {
				case ALIGN_TYPES.CENTER:
					offsetY += boxHeight / 2;
					break;
				case ALIGN_TYPES.BOTTOM:
					offsetY += boxHeight;
					break;
			}
		}

		return { x: offsetX, y: offsetY };
	}

	// Alternative more efficient color transformation using globalCompositeOperation
	private applyColorTransformFast(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, color: string): void {
		// This approach is faster but less flexible
		ctx.globalCompositeOperation = "source-in";
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.globalCompositeOperation = "source-over"; // Reset to default
	}
}
