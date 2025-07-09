import { Events } from "../events";
import type { GameContext } from "../game";
import type { Scene } from "../scenes";
import type { BBox } from "../utils/maths";
import { Entity } from "./Entity";
import { setupEntity } from "./Entity.factory";

export type ButtonDTO = {
	x: number;
	y: number;
	width: number;
	height: number;
	selectionRect: BBox;
};

export class ButtonEntity extends Entity {
	public selectionRect: BBox;
	private lastX = -1;
	private lastY = -1;
	public fillcolor: string | undefined;

	constructor(buttonObj: ButtonDTO) {
		super(buttonObj.x, buttonObj.y);
		if (buttonObj.width && buttonObj.height) this.bbox.setSize(buttonObj.width, buttonObj.height);
		this.selectionRect = buttonObj.selectionRect;

		this.fillcolor = "transparent";
	}

	public update(gc: GameContext, scene: Scene): void {
		if (this.lastX !== gc.mouse.x || this.lastY !== gc.mouse.y) {
			this.lastX = gc.mouse.x;
			this.lastY = gc.mouse.y;
		}

		const isInside = this.selectionRect.isPointInside(this.lastX, this.lastY);

		// if (selectedIdx === -1 && gc.tick % 5 === 0) {
		// 	// this.keys.previous;
		// 	if (gc.keys.isPressed("ArrowUp")) {
		// 		selectedIdx = this.selectedIdx - 1;
		// 	}
		// 	if (gc.keys.isPressed("ArrowDown")) {
		// 		selectedIdx = this.selectedIdx + 1;
		// 		if (selectedIdx >= this.items.length) selectedIdx--;
		// 	}
		// 	if (gc.keys.isPressed("Enter")) {
		// 		scene.emit(Events.BUTTON_CLICKED, this.selectedIdx);
		// 	}
		// }

		// if (selectedIdx >= 0 && this.selectedIdx !== selectedIdx) {
		// 	if (this.selectedIdx >= 0) this.items[this.selectedIdx].fillcolor = "transparent";
		// 	this.selectedIdx = selectedIdx;
		// 	this.items[this.selectedIdx].fillcolor = this.selection?.background;
		// 	scene.emit(Events.MENU_ITEM_SELECTED, this.selectedIdx);
		// }

		if (isInside) {
			this.fillcolor = "red";
			if (gc.mouse.down) scene.emit(Events.BUTTON_CLICKED, this);
		} else this.fillcolor = "transparent";
	}

	render(gc) {
		const ctx = gc.viewport.ctx;

		if (this.fillcolor) {
			ctx.fillStyle = this.fillcolor;
			ctx.fillRect(this.selectionRect.left, this.selectionRect.top, this.selectionRect.width, this.selectionRect.height);
			// ctx.strokeStyle = this.fillcolor;
			// ctx.strokeRect(this.selectionRect.left, this.selectionRect.top, this.selectionRect.width, this.selectionRect.height);
		}
		// if (this.strokecolor) {
		// 	ctx.strokeStyle = this.strokecolor;
		// 	ctx.strokeRect(this.bbox.left, this.bbox.top, this.bbox.width, this.bbox.height);
		// }
	}
}

// Register this entity with the factory
setupEntity({ name: "button", classType: ButtonEntity });
