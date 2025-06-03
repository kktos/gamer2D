import type { Font } from "../game/Font";
import type { ResourceManager } from "../game/ResourceManager";
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
	isDynamic?: boolean;
};

export class TextEntity extends Entity {
	public color: string;
	public text: string;

	private font: Font;
	private align: TAlignType;
	private valign: TAlignType;
	private fontsize: number;
	private bgcolor: string | undefined;
	private isDynamic: boolean;

	constructor(resourceMgr: ResourceManager, textObj: TextDTO) {
		super(resourceMgr, textObj.pos[0], textObj.pos[1]);

		this.isFixed = false;
		this.isDynamic = !!textObj.isDynamic;
		this.font = resourceMgr.get("font", resourceMgr.mainFontName);
		this.text = textObj.text;
		this.color = textObj.color?.value ?? "white";
		// bgcolor undefined is handled by Font -> transparent
		this.bgcolor = textObj.bgcolor;
		this.align = textObj.align ?? ALIGN_TYPES.LEFT;
		this.valign = textObj.valign ?? ALIGN_TYPES.TOP;
		this.fontsize = textObj.size ?? 8;
		this.bbox.setSize(textObj.width ?? 0, textObj.height ?? 0);
	}

	render(gc) {
		const ctx = gc.viewport.ctx;
		this.font.size = this.fontsize;
		this.font.align = this.align;
		this.font.valign = this.valign;
		this.bbox = this.font.print({
			ctx: ctx,
			text: this.text,
			x: this.bbox.left,
			y: this.bbox.top,
			color: this.color,
			width: this.bbox.width,
			height: this.bbox.height,
			bgcolor: this.bgcolor,
			isDynamic: this.isDynamic,
		});
	}
}
