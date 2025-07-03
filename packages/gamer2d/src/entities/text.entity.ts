import type { Font } from "../game/Font";
import type { ResourceManager } from "../game/ResourceManager";
import { ALIGN_TYPES, type TAlignType } from "../script/compiler2/types/align.type";
import type { Signal } from "../utils/signals.util";
import { Entity } from "./Entity";
import { setupEntity } from "./Entity.factory";

export type TextDTO = {
	x: Signal<number>;
	y: Signal<number>;
	text: Signal<string>;
	color?: Signal<string>;
	align?: TAlignType;
	valign?: TAlignType;
	font?: Font;
	size?: number;
	width?: number;
	height?: number;
	bgcolor?: string;
	isDynamic?: boolean;
};

export class TextEntity extends Entity {
	public color: string;
	public text: Signal<string>;

	public x: Signal<number>;
	public y: Signal<number>;

	private font: Font;
	private align: TAlignType;
	private valign: TAlignType;
	private fontsize: number;
	private bgcolor: string | undefined;
	private isDynamic: boolean;
	public alignWidth: number;
	public alignHeight: number;

	constructor(resourceMgr: ResourceManager, textObj: TextDTO) {
		super(resourceMgr, textObj.x.value, textObj.y.value);

		this.x = textObj.x;
		this.y = textObj.y;
		this.isFixed = false;
		this.isDynamic = !!textObj.isDynamic;
		this.font = textObj.font ?? resourceMgr.get("font", resourceMgr.mainFontName);
		this.text = textObj.text;
		this.color = textObj.color?.value ?? "white";
		this.bgcolor = textObj.bgcolor;
		this.align = textObj.align ?? ALIGN_TYPES.LEFT;
		this.valign = textObj.valign ?? ALIGN_TYPES.TOP;
		this.fontsize = textObj.size ?? 8;
		this.alignWidth = textObj.width ?? 0;
		this.alignHeight = textObj.height ?? 0;
	}

	render(gc) {
		const ctx = gc.viewport.ctx;
		this.font.size = this.fontsize;
		this.font.align = this.align;
		this.font.valign = this.valign;
		this.bbox = this.font.print({
			ctx: ctx,
			text: this.text.value,
			x: this.x.value,
			y: this.y.value,
			color: this.color,
			width: this.alignWidth,
			height: this.alignHeight,
			bgcolor: this.bgcolor,
			isDynamic: this.isDynamic,
		});
	}
}

// Register this entity with the factory
setupEntity({ name: "text", classType: TextEntity });
