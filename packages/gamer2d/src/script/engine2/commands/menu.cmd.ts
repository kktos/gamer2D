import type { Entity } from "../../../entities";
import { type MenuDTO, MenuEntity } from "../../../entities/menu.entity";
import { type RectDTO, RectEntity } from "../../../entities/rect.entity";
import { Events } from "../../../events";
import type { GameContext } from "../../../game";
import { getBoundingBox } from "../../../utils/maths/bbox.util";
import type { TNeatCommand, TNeatMenuCommand } from "../../compiler2/types/commands.type";
import { runCommands } from "../exec";
import type { ExecutionContext } from "../exec.context";
import { evalExpressionAs } from "../expr.eval";
import type { TNeatItemAction } from "./item.cmd";

export function executeMenuCommand(command: TNeatMenuCommand, context: ExecutionContext) {
	const gc = context.gc as GameContext;

	context.variables.set(command.id, {
		selected: -1,
		selectedItem: null,
	});

	let padding = [0, 0];
	if (command.selection?.pad)
		padding = [evalExpressionAs(command.selection.pad[0], context, "number"), evalExpressionAs(command.selection.pad[1], context, "number")];

	const rectObj: RectDTO = {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		fillcolor: "transparent",
	};

	const menuItems = runCommands(command.items, context) as (Entity | Entity[])[];
	const firstItem = Array.isArray(menuItems[0]) ? menuItems[0][0] : menuItems[0];

	const actions: TNeatCommand[][] = [];

	const menuObj: MenuDTO = {
		selection: command.selection ?? {},
		keys: command.keys,
		items: [],
	};
	if (!menuObj.selection.background) {
		menuObj.selection.background = gc.resourceManager.settings.get<string>("MENU.COLOR_SELECTED") ?? "white";
	}
	for (let i = 0; i < menuItems.length; i++) {
		const item = menuItems[i];

		if ("type" in item && item.type === "ACTION") {
			actions[menuObj.items.length - 1] = (item as unknown as TNeatItemAction).value;
			continue;
		}

		const rectSelectionEntity = new RectEntity(rectObj);
		rectSelectionEntity.bbox = getBoundingBox(gc, item);
		rectSelectionEntity.bbox.inflate(padding[0], padding[1]);
		gc.scene?.addTask(Events.TASK_ADD_BEFORE_ENTITY, firstItem, rectSelectionEntity);
		menuObj.items.push(rectSelectionEntity);
	}

	const entity = new MenuEntity(menuObj);
	entity.id = command.id;

	gc.scene?.addTask(Events.TASK_ADD_ENTITY, entity);
	gc.scene?.on(Events.MENU_ITEM_SELECTED, (idx) => {
		context.variables.set(command.id, {
			selected: idx as number,
			selectedItem: menuItems[idx as number],
		});
		// const menu = context.variables.get(command.id) as { selected: number };
		// menu.selected = idx as number;
	});

	gc.scene?.on(Events.MENU_ITEM_CLICKED, (idx) => {
		const action = actions[idx as number];
		if (action) runCommands(action, context);
	});

	// console.log("KEYS", command.keys);

	return entity;
}
