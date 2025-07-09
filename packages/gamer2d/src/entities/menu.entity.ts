import { Events } from "../events";
import type { GameContext } from "../game";
import type { Scene } from "../scenes";
import type { TNeatMenuKeys, TNeatMenuSelection } from "../script/compiler2/types/commands.type";
import { Entity } from "./Entity";
import { setupEntity } from "./Entity.factory";
import type { RectEntity } from "./rect.entity";

/**
TODO:
		this.DefaultColorSelectedText = gc.resourceManager.settings.get("MENU.COLORS.SELECTED_TEXT") as string;
		this.DefaultColorSelectedRect = gc.resourceManager.settings.get("MENU.COLORS.SELECT_RECT") as string;


	handleEvent(e: GameEvent) {
		switch (e.type) {
			case "click": {
				const menuIdx = this.findMenuByPoint(e.x, e.y);
				if (menuIdx >= 0) {
					this.execMenuItemAction(menuIdx);
					return true;
				}
				break;
			}
			case "mousemove": {
				const menuIdx = this.findMenuByPoint(e.x, e.y);
				if (this.layer.scene.wannaShowCursor) this.gc.viewport.canvas.style.cursor = menuIdx >= 0 ? "pointer" : "default";
				if (menuIdx >= 0) {
					this.selectMenuItem(menuIdx);
					return true;
				}
				break;
			}
			case "joybuttondown":
				if (e.X || e.TRIGGER_RIGHT) {
					this.execMenuItemAction();
					return true;
				}
				if (e.CURSOR_UP) {
					this.selectPreviousItem();
					return true;
				}
				if (e.CURSOR_DOWN) {
					this.selectNextItem();
					return true;
				}
				break;

			case "keyup":
				switch ((e as KeyEvent).key) {
					case "Control":
						this.wannaDisplayHitzones = false;
						break;
				}
				break;
			case "keydown":
				if ((e as KeyEvent).key in this.keys) {
					this.keys[(e as KeyEvent).key]();
					return true;
				}
				if ((e as KeyEvent).key === "Control") {
					this.wannaDisplayHitzones = true;
					return false;
				}
				break;
		}
		return false;
	}


*/

export type MenuDTO = {
	selection: TNeatMenuSelection;
	keys?: TNeatMenuKeys;
	items: RectEntity[];
};

export class MenuEntity extends Entity {
	public selection: TNeatMenuSelection;
	private keys?: TNeatMenuKeys;
	private items: RectEntity[];
	private selectedIdx = -1;
	private lastX = -1;
	private lastY = -1;

	constructor(menuObj: MenuDTO) {
		super(0, 0);
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
			selectedIdx = this.findMenuByPoint(this.lastX, this.lastY);
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
			if (this.selectedIdx >= 0) this.items[this.selectedIdx].fillcolor = "transparent";
			this.selectedIdx = selectedIdx;
			this.items[this.selectedIdx].fillcolor = this.selection?.background;
			scene.emit(Events.MENU_ITEM_SELECTED, this.selectedIdx);
		}

		if (gc.mouse.down && this.selectedIdx >= 0) scene.emit(Events.MENU_ITEM_CLICKED, this.selectedIdx);
	}
}

// Register this entity with the factory
setupEntity({ name: "menu", classType: MenuEntity });
