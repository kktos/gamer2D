import { Events } from "../events";
import type { GameContext } from "../game";
import type { ResourceManager } from "../game/ResourceManager";
import type { Scene } from "../scene";
import type { TNeatMenuKeys, TNeatMenuSelection } from "../script/compiler2/types/commands.type";
import { Entity } from "./Entity";
import { setupEntity } from "./Entity.factory";
import type { RectEntity } from "./rect.entity";

export type MenuDTO = {
	selection: TNeatMenuSelection;
	keys: TNeatMenuKeys;
	items: RectEntity[];
};

export class MenuEntity extends Entity {
	public selection: TNeatMenuSelection;
	private keys: TNeatMenuKeys;
	private items: RectEntity[];
	private selectedIdx = 0;
	private lastX = -1;
	private lastY = -1;

	constructor(resourceMgr: ResourceManager, menuObj: MenuDTO) {
		super(resourceMgr, 0, 0);
		this.selection = menuObj.selection;
		this.keys = menuObj.keys;
		this.items = menuObj.items;
	}

	findMenuByPoint(x: number, y: number) {
		return this.items.findIndex((item) => item.bbox.isPointInside(x, y));
	}

	public update(gc: GameContext, scene: Scene): void {
		let selectedIdx = -1;
		if (this.lastX !== gc.mouse.x || this.lastY !== gc.mouse.y) {
			this.lastX = gc.mouse.x;
			this.lastY = gc.mouse.y;
			selectedIdx = this.findMenuByPoint(gc.mouse.x, gc.mouse.y);
		}

		if (selectedIdx === -1 && gc.tick % 5 === 0) {
			// this.keys.previous;
			if (gc.keys.isPressed("ArrowUp")) {
				selectedIdx = this.selectedIdx - 1;
			}
			if (gc.keys.isPressed("ArrowDown")) {
				selectedIdx = this.selectedIdx + 1;
				if (selectedIdx >= this.items.length) selectedIdx--;
			}
			if (gc.keys.isPressed("Enter")) {
				scene.emit(Events.MENU_ITEM_CLICKED, this.selectedIdx);
			}
		}

		if (selectedIdx >= 0 && this.selectedIdx !== selectedIdx) {
			this.items[this.selectedIdx].fillcolor = "transparent";
			this.selectedIdx = selectedIdx;
			this.items[this.selectedIdx].fillcolor = this.selection.background;
			scene.emit(Events.MENU_ITEM_SELECTED, this.selectedIdx);
		}
	}
}

// Register this entity with the factory
setupEntity({ name: "menu", classType: MenuEntity });
