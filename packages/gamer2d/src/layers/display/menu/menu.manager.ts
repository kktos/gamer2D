import type { TextEntity } from "../../../entities/text.entity";
import { Events } from "../../../events/Events";
import type { SpriteSheet } from "../../../game/Spritesheet";
import type { GameContext } from "../../../game/types/GameContext";
import type { GameEvent, KeyEvent } from "../../../game/types/GameEvent";
import { BBox } from "../../../maths/BBox.class";
import type { TMenu, TMenuItem, TMenuItemRendered } from "../../../script/compiler/layers/display/layout/menu.rules";
import type { TRepeatItem } from "../../../script/compiler/layers/display/layout/repeat.rules";
import type { TActionStatement } from "../../../script/compiler/shared/action.rules";
import { execAction } from "../../../script/engine/exec.script";
import { OP_TYPES, OP_TYPES_STR } from "../../../types/operation.types";
import type { DisplayLayer } from "../../display.layer";
import { repeat } from "../repeat.manager";
import { loadSprite, renderSprite } from "../sprite.renderer";
import { computeBBox } from "./menu.utils";

export type SelectionSprites = { selectionSprites?: { left?: { ss: SpriteSheet; sprite: string }; right?: { ss: SpriteSheet; sprite: string } } };

export class GameMenu {
	private wannaDisplayHitzones: boolean;
	public itemSelected: number;
	private keys: Record<string, () => void>;
	private DefaultColorSelectedText: string;
	private DefaultColorSelectedRect: string;

	static create(gc: GameContext, layer: DisplayLayer, menus: TMenu[] | null): GameMenu | null {
		if (!menus || menus.length === 0) return null;
		if (menus.length > 1) console.error("Only one menu is allowed per viewport. Using the first one.");
		return new GameMenu(gc, layer, menus[0]);
	}

	constructor(
		private gc: GameContext,
		private layer: DisplayLayer,
		private menu: TMenu & SelectionSprites,
	) {
		this.itemSelected = 0;
		this.wannaDisplayHitzones = false;
		this.DefaultColorSelectedText = gc.resourceManager.settings.get("MENU.COLORS.SELECTED_TEXT") as string;
		this.DefaultColorSelectedRect = gc.resourceManager.settings.get("MENU.COLORS.SELECT_RECT") as string;

		this.keys = {};
		const keys = menu.keys ?? {};
		if (!keys.previous) {
			keys.previous = ["ArrowUp", "ArrowLeft"];
		}
		if (!keys.next) {
			keys.next = ["ArrowDown", "ArrowRight"];
		}
		if (!keys.select) {
			keys.select = ["Enter"];
		}
		for (const key of keys.previous) this.keys[key] = () => this.selectPreviousItem();
		for (const key of keys.next) this.keys[key] = () => this.selectNextItem();
		for (const key of keys.select) this.keys[key] = () => this.execMenuItemAction();
	}

	get items() {
		return this.menu.items;
	}

	prepareMenu() {
		if (this.menu.selection?.var) {
			this.layer.vars.set(this.menu.selection.var, this.itemSelected);
		} else {
			this.layer.vars.set("itemIdxSelected", this.itemSelected);
			this.layer.vars.set("itemSelected", "");
		}

		const menuItems: TRepeatItem[] = [];
		for (let idx = 0; idx < this.menu.items.length; idx++) {
			const item = this.menu.items[idx];

			if (item.type === OP_TYPES.REPEAT) {
				repeat(item, (menuitem: TRepeatItem) => menuItems.push(menuitem), this.layer.vars);
				continue;
			}

			menuItems.push(item);
		}

		computeBBox(this.gc, this.layer, menuItems);

		this.menu.items = menuItems;

		this.menu.selectionSprites = undefined;
		if (this.menu.selection) {
			this.menu.selectionSprites = {};
			if (this.menu.selection.left) {
				this.menu.selectionSprites.left = loadSprite(this.gc, this.menu.selection.left);
			}
			if (this.menu.selection.right) {
				this.menu.selectionSprites.right = loadSprite(this.gc, this.menu.selection.right);
			}
		}
	}

	findMenuByPoint(x: number, y: number) {
		return (this.menu.items as TMenuItemRendered[]).findIndex((item) => item.bbox().isPointInside(x, y));
	}

	execMenuItemAction(idx?: number) {
		const selectedIdx = idx == null ? this.itemSelected : idx;
		const menuItem = this.menu.items[selectedIdx];

		if ("action" in menuItem) {
			return execAction({ vars: this.layer.vars }, menuItem.action as TActionStatement[]);
		}

		this.layer.scene.emit(Events.MENU_ITEM_CLICKED, selectedIdx);
	}

	selectPreviousItem() {
		this.selectMenuItem(this.itemSelected - 1);
	}

	selectNextItem() {
		this.selectMenuItem(this.itemSelected + 1);
	}

	selectMenuItem(idx: number) {
		this.itemSelected = (idx < 0 ? this.menu.items.length - 1 : idx) % this.menu.items.length;

		if (this.menu.selection?.var) {
			this.layer.vars.set(this.menu.selection.var, this.itemSelected);
		} else {
			this.layer.vars.set("itemIdxSelected", this.itemSelected);
			this.layer.vars.set("itemSelected", this.menu?.items[this.itemSelected]);
		}
		this.layer.scene.emit(Events.MENU_ITEM_SELECTED, this.itemSelected);
	}

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

	renderMenu(ctx: CanvasRenderingContext2D) {
		const selectedColor = this.menu.selection?.color ?? this.DefaultColorSelectedText;

		const renderMenuItem = (item: TMenuItem, isSelected: boolean) => {
			switch (item.type) {
				case OP_TYPES.TEXT: {
					if (!item.entity) break;
					if (isSelected) {
						(item.entity as TextEntity).color = selectedColor;
						break;
					}
					if (item.color) {
						(item.entity as TextEntity).color = item.color.value;
					}
					break;
				}
				case OP_TYPES.SPRITE:
					renderSprite(this.gc, this.layer, item);
					break;
				case OP_TYPES.GROUP:
					{
						const submenu = item;
						for (const item of submenu.items) {
							renderMenuItem(item, isSelected);
						}
					}
					break;
			}
		};

		for (let idx = 0; idx < this.menu.items.length; idx++) {
			const item = this.menu.items[idx] as TMenuItemRendered;
			if (idx === this.itemSelected) {
				this.renderSelection(item);
				renderMenuItem(item, true);
				continue;
			}
			renderMenuItem(item, false);
		}

		if (this.wannaDisplayHitzones) {
			const items = this.menu.items;
			for (let idx = 0; idx < items.length; idx++) {
				const item = items[idx];
				if ("bbox" in item && item.bbox) {
					const bbox = item.bbox();
					ctx.strokeStyle = "red";
					ctx.strokeRect(bbox.left, bbox.top, bbox.right - bbox.left, bbox.bottom - bbox.top);
					ctx.fillStyle = "red";
					ctx.fillText(`${OP_TYPES_STR[item.type]}`, bbox.left, bbox.bottom + 10);
				}

				ctx.fillStyle = "white";
				const str = `Selected: ${this.itemSelected} X: ${this.gc.mouse.x} Y: ${this.gc.mouse.y}`;
				ctx.fillText(str, 15, 15);
			}
		}
	}

	renderSelection(item: TMenuItemRendered) {
		const bkgndColor = this.menu.selection?.background?.value;
		const ctx = this.gc.viewport.ctx;
		const rect = item.bbox();

		if (bkgndColor) {
			const selectRect = BBox.copy(rect, 2, 5); //   growRect(rect, 2, 5);
			ctx.fillStyle = bkgndColor;
			ctx.fillRect(selectRect.left, selectRect.top, selectRect.width + 2, selectRect.height - 4);
		}
		const color = this.menu.selection?.color ?? this.DefaultColorSelectedRect;
		if (color) {
			ctx.strokeStyle = color;
			ctx.beginPath();
			ctx.moveTo(rect.left - 2, rect.top - 5);
			ctx.lineTo(rect.right + 4, rect.top - 5);
			ctx.moveTo(rect.left - 2, rect.bottom + 2);
			ctx.lineTo(rect.right + 4, rect.bottom + 2);
			ctx.stroke();
		}

		if (this.menu.selectionSprites?.left) {
			const { ss, sprite } = this.menu.selectionSprites.left;
			ss.drawAnim(sprite, ctx, rect.left - 25, rect.top - 2, this.gc.tick);
		}
		if (this.menu.selectionSprites?.right) {
			const { ss, sprite } = this.menu.selectionSprites.right;
			ss.drawAnim(sprite, ctx, rect.right + 4, rect.top - 2, this.gc.tick);
		}
	}
}
