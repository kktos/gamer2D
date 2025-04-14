import ENV from "../env";
import type Font from "../game/Font";
import type ResourceManager from "../game/ResourceManager";
import { FadeTrait } from "../traits/fade.trait";
import { Entity } from "./Entity";

export type TextDTO = {
	pos: [number, number] | (() => [number, number]);
	text: string | (() => string);
	color?: string;
	align?: number;
	valign?: number;
	size?: number;
	anim?: {
		name: string;
	};
	width?: string | number;
	height?: string | number;
	bgcolor?: string;
};

export default class TextEntity extends Entity {
	public color: string;

	private font: Font;
	private text: () => string;
	private align: number;
	private valign: number;
	private fontsize: number;
	private bgcolor: string;
	private pos: () => [number, number];

	constructor(resourceMgr: ResourceManager, textObj: TextDTO) {
		super(resourceMgr, textObj.pos[0], textObj.pos[1]);

		this.font = resourceMgr.get("font", ENV.MAIN_FONT) as Font;

		this.text = typeof textObj.text !== "function" ? () => textObj.text as string : textObj.text;
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

		switch (textObj.anim?.name) {
			case "fadein":
				this.addTrait(new FadeTrait("in", this.color));
				this.color = "#000";
				break;
			case "fadeout":
				this.addTrait(new FadeTrait("out", this.color));
		}
	}

	render(gc) {
		const ctx = gc.viewport.ctx;
		this.font.size = this.fontsize;
		this.font.align = this.align;
		this.font.valign = this.valign;
		const [x, y] = this.pos();
		this.font.print({
			ctx: ctx,
			text: this.text(),
			x,
			y,
			color: this.color,
			width: this.size.x,
			height: this.size.y,
			bgcolor: this.bgcolor,
		});
	}
}
