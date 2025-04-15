import ENV from "../env";
import type Font from "../game/Font";
import type ResourceManager from "../game/ResourceManager";
import { Entity } from "./Entity";

export type TextDTO = {
	pos: [number, number] | (() => [number, number]);
	text: string | (() => string);
	color?: string;
	align?: number;
	valign?: number;
	size?: number;
	width?: string | number;
	height?: string | number;
	bgcolor?: string;
};

export class TextEntity extends Entity {
	public color: string;
	// public text: () => string;

	get text() {
		return this._text();
	}
	set text(value) {
		this._text = () => value;
	}

	private _text: () => string;
	private font: Font;
	private align: number;
	private valign: number;
	private fontsize: number;
	private bgcolor: string;
	private pos: () => [number, number];

	constructor(resourceMgr: ResourceManager, textObj: TextDTO) {
		super(resourceMgr, textObj.pos[0], textObj.pos[1]);

		this.font = resourceMgr.get("font", ENV.MAIN_FONT) as Font;

		this._text = typeof textObj.text !== "function" ? () => textObj.text as string : textObj.text;
		this.pos = typeof textObj.pos !== "function" ? () => textObj.pos as [number, number] : textObj.pos;
		this.color = textObj.color;
		this.bgcolor = textObj.bgcolor;
		this.align = textObj.align;
		this.valign = textObj.valign;
		this.fontsize = textObj.size;
		this.size = {
			x: textObj.width ? Number(textObj.width) : 0,
			y: textObj.height ? Number(textObj.height) : 0,
		};
	}

	render(gc) {
		const ctx = gc.viewport.ctx;
		this.font.size = this.fontsize;
		this.font.align = this.align;
		this.font.valign = this.valign;
		const [x, y] = this.pos();
		this.font.print({
			ctx: ctx,
			text: this.text,
			x,
			y,
			color: this.color,
			width: this.size.x,
			height: this.size.y,
			bgcolor: this.bgcolor,
		});
	}
}
