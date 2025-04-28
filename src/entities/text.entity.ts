import type Font from "../game/Font";
import type ResourceManager from "../game/ResourceManager";
import type { BBox } from "../maths/math";
import { ALIGN_TYPES, type TAlignType } from "../script/compiler/layers/display/layout/text-sprite-props.rules";
import type { ArgColor } from "../types/value.types";
import { Entity } from "./Entity";

export type TextDTO = {
	pos: [number, number];
	text: string;
	color?: ArgColor;
	align?: TAlignType;
	valign?: TAlignType;
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
	private align: TAlignType;
	private valign: TAlignType;
	private fontsize: number;
	private bgcolor: string;

	constructor(resourceMgr: ResourceManager, textObj: TextDTO) {
		super(resourceMgr, textObj.pos[0], textObj.pos[1]);

		this.font = resourceMgr.get("font", resourceMgr.mainFontName);
		this.text = textObj.text;
		this.color = textObj.color?.value ?? "white";
		this.bgcolor = textObj.bgcolor ?? "black";
		this.align = textObj.align ?? ALIGN_TYPES.LEFT;
		this.valign = textObj.valign ?? ALIGN_TYPES.TOP;
		this.fontsize = textObj.size ?? 8;
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
