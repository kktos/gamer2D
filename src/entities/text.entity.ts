import type Font from "../game/Font";
import type ResourceManager from "../game/ResourceManager";
import type { BBox } from "../maths/math";
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
	public bbox: BBox;

	private font: Font;
	private align: number;
	private valign: number;
	private fontsize: number;
	private bgcolor: string;

	constructor(resourceMgr: ResourceManager, textObj: TextDTO) {
		super(resourceMgr, textObj.pos[0], textObj.pos[1]);

		this.font = resourceMgr.get("font", resourceMgr.mainFontName);
		this.text = textObj.text;
		this.color = textObj.color.value;
		this.bgcolor = textObj.bgcolor;
		this.align = textObj.align;
		this.valign = textObj.valign;
		this.fontsize = textObj.size;
		this.width = textObj.width ?? 0;
		this.height = textObj.height ?? 0;
		this.bbox = { left: this.left, top: this.top, right: this.right, bottom: this.bottom };
	}

	render(gc) {
		const ctx = gc.viewport.ctx;
		this.font.size = this.fontsize;
		this.font.align = this.align;
		this.font.valign = this.valign;
		this.bbox = this.font.print({
			ctx: ctx,
			text: this.text,
			x: this.left,
			y: this.top,
			color: this.color,
			width: this.width,
			height: this.height,
			bgcolor: this.bgcolor,
		});
	}
}
