import type { Entity } from "../../entities/Entity";
import type { TextEntity } from "../../entities/text.entity";
import ENV from "../../env";
import type GameContext from "../../game/GameContext";
import type { SpriteSheet } from "../../game/Spritesheet";
import { type BBox, growRect } from "../../maths/math";
import type { TMenu, TMenuItem, TMenuItemGroup } from "../../script/compiler/display/layout/menu.rules";
import type { TRepeatItem } from "../../script/compiler/display/layout/repeat.rules";
import type { TSprite } from "../../script/compiler/display/layout/sprite.rules";
import type { TText } from "../../script/compiler/display/layout/text.rules";
import { evalNumber } from "../../script/engine/eval.script";
import { OP_TYPES } from "../../types/operation.types";
import type { DisplayLayer } from "../display.layer";
import { repeat } from "./repeat.manager";
import { loadSprite, renderSprite } from "./sprite.renderer";

type SelectionSprites = { selectionSprites?: { left?: { ss: SpriteSheet; sprite: string }; right?: { ss: SpriteSheet; sprite: string } } };

export function prepareMenu(gc: GameContext, layer: DisplayLayer, op: TMenu & SelectionSprites) {
	const menuItems: (TMenuItemGroup | TText | TSprite)[] = [];
	for (let idx = 0; idx < op.items.length; idx++) {
		const item = op.items[idx];
		switch (item.type) {
			case OP_TYPES.REPEAT:
				repeat(item, (menuitem: TRepeatItem) => menuItems.push(menuitem), layer.vars);
				break;
			// case "text":
			default:
				menuItems.push(item);
				break;
		}
	}

	computeBBox(gc, layer, menuItems);

	op.items = menuItems;

	op.selectionSprites = undefined;
	if (op.selection) {
		op.selectionSprites = {};
		if (op.selection.left) {
			op.selectionSprites.left = loadSprite(gc, op.selection.left);
		}
		if (op.selection.right) {
			op.selectionSprites.right = loadSprite(gc, op.selection.right);
		}
	}
}

export function renderMenu(gc: GameContext, layer: DisplayLayer, menu: TMenu) {
	const selectedColor = menu.selection?.color ?? ENV.COLORS.SELECTED_TEXT;

	const renderMenuItem = (item: TMenuItem & { entity?: Entity }, layer: DisplayLayer, isSelected: boolean) => {
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
				renderSprite(gc, layer, item);
				break;
			case OP_TYPES.GROUP:
				{
					const submenu = item;
					for (const item of submenu.items) {
						renderMenuItem(item, layer, isSelected);
					}
				}
				break;
		}
	};

	for (let idx = 0; idx < menu.items.length; idx++) {
		const item = menu.items[idx];
		if (idx === layer.itemSelected) {
			renderSelection(gc, menu, item);
			renderMenuItem(item, layer, true);
			continue;
		}
		renderMenuItem(item, layer, false);
	}
}

function computeBBox(gc: GameContext, layer: DisplayLayer, items: (TMenuItemGroup | TText | TSprite)[], isGroup = false) {
	let bbox: BBox | null = null;
	for (let idx = 0; idx < items.length; idx++) {
		const item = items[idx];
		switch (item.type) {
			case OP_TYPES.TEXT: {
				layer.addText(item);
				if (item.align) layer.font.align = item.align;
				if (item.size) layer.font.size = item.size;
				const left = evalNumber({ vars: layer.vars }, item.pos[0]);
				const top = evalNumber({ vars: layer.vars }, item.pos[1]);
				const r = layer.font.textRect(item.text, left, top);
				item.bbox = { left: r[0], top: r[1], right: r[2], bottom: r[3] };
				break;
			}
			case OP_TYPES.SPRITE: {
				const { ss, sprite } = loadSprite(gc, item.sprite);
				const size = ss.spriteSize(sprite);
				item.bbox = {
					left: item.pos[0],
					top: item.pos[1],
					right: item.pos[0] + size.x,
					bottom: +item.pos[1] + size.y,
				};
				break;
			}
			case OP_TYPES.GROUP: {
				item.bbox = computeBBox(gc, layer, item.items, true);
				break;
			}
		}
		if (isGroup && item.bbox) {
			if (bbox === null) {
				bbox = { ...item.bbox };
				continue;
			}
			if (item.bbox.left < bbox.left) {
				bbox.left = item.bbox.left;
			}
			if (item.bbox.top < bbox.top) {
				bbox.top = item.bbox.top;
			}
			if (item.bbox.right > bbox.right) {
				bbox.right = item.bbox.right;
			}
			if (item.bbox.bottom > bbox.bottom) {
				bbox.bottom = item.bbox.bottom;
			}
		}
	}
	return bbox;
}

function renderSelection(gc: GameContext, menu: TMenu & SelectionSprites, item) {
	const bkgndColor = menu.selection?.background.value;
	const ctx = gc.viewport.ctx;
	const rect = item.bbox;

	if (bkgndColor) {
		const selectRect = growRect(rect, 2, 5);
		ctx.fillStyle = bkgndColor;
		ctx.fillRect(selectRect.x, selectRect.y, selectRect.width + 2, selectRect.height - 4);
	}
	const color = menu.selection?.color ?? ENV.COLORS.SELECT_RECT;
	if (color) {
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(rect.left - 2, rect.top - 5);
		ctx.lineTo(rect.right + 4, rect.top - 5);
		ctx.moveTo(rect.left - 2, rect.bottom + 2);
		ctx.lineTo(rect.right + 4, rect.bottom + 2);
		ctx.stroke();
	}

	if (menu.selectionSprites?.left) {
		const { ss, sprite } = menu.selectionSprites.left;
		ss.drawAnim(sprite, ctx, rect.left - 25, rect.top - 2, gc.tick);
	}
	if (menu.selectionSprites?.right) {
		const { ss, sprite } = menu.selectionSprites.right;
		ss.drawAnim(sprite, ctx, rect.right + 4, rect.top - 2, gc.tick);
	}
}
