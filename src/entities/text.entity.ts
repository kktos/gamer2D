import ENV from "../env";
import type Font from "../game/Font";
import type ResourceManager from "../game/ResourceManager";
import type { ArgColor } from "../types/value.types";
import { Entity } from "./Entity";

export type TextDTO = {
	pos: [number, number];
	text: string;
	color?: ArgColor;
	align?: number;
	valign?: number;
	size?: number;
	width?: number;
	height?: number;
	bgcolor?: string;
};

export class TextEntity extends Entity {
	public color: string;
	public text: string;

	private font: Font;
	private align: number;
	private valign: number;
	private fontsize: number;
	private bgcolor: string;

	constructor(resourceMgr: ResourceManager, textObj: TextDTO) {
		super(resourceMgr, textObj.pos[0], textObj.pos[1]);

		this.font = resourceMgr.get("font", ENV.MAIN_FONT) as Font;
		this.text = textObj.text;
		this.color = textObj.color.value;
		this.bgcolor = textObj.bgcolor;
		this.align = textObj.align;
		this.valign = textObj.valign;
		this.fontsize = textObj.size;
		this.size = {
			x: textObj.width ?? 0,
			y: textObj.height ?? 0,
		};
	}

	render(gc) {
		const ctx = gc.viewport.ctx;
		this.font.size = this.fontsize;
		this.font.align = this.align;
		this.font.valign = this.valign;
		this.font.print({
			ctx: ctx,
			text: this.text,
			x: this.left,
			y: this.top,
			color: this.color,
			width: this.size.x,
			height: this.size.y,
			bgcolor: this.bgcolor,
		});
	}
}
