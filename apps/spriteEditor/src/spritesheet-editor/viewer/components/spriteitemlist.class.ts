import { BBox } from "gamer2d/maths/BBox.class";

type SpriteItem = { width: number; height: number };

export class SpriteItemList {
	private items: { name: string; item: SpriteItem }[] = [];
	public bboxList: BBox[] = [];
	public getImage: ((name: string, tick: number) => HTMLCanvasElement | undefined) | undefined = undefined;

	constructor(public name: string) {
		this.name = name;
	}

	public add(name: string, item: SpriteItem) {
		this.bboxList.push(new BBox(0, 0, item.width, item.height));
		this.items.push({ name, item });
	}

	public forEach(cb: (name: string, item: SpriteItem, bbox: BBox, idx: number) => void) {
		this.items.forEach((value, idx) => {
			cb(value.name, value.item, this.bboxList[idx], idx);
		});
	}

	public findBboxIndex(x: number, y: number) {
		return this.bboxList.findIndex((bbox) => bbox.isPointInside(x, y));
	}

	public get length() {
		return this.items.length;
	}

	public get(idx: number) {
		return this.items[idx];
	}
}
