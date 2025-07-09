import type { Entity } from "../../../entities";
import { type ButtonDTO, ButtonEntity } from "../../../entities/button.entity";
import { Events } from "../../../events";
import type { GameContext } from "../../../game";
import { BBox } from "../../../utils/maths";
import { getBoundingBox } from "../../../utils/maths/bbox.util";
import type {
	TNeatButtonCommand,
	TNeatButtonDefineCommand,
	TNeatButtonInstantiationWithBodyCommand,
	TNeatButtonInstantiationWithoutBodyCommand,
	TNeatCommand,
} from "../../compiler2/types/commands.type";
import { runCommands } from "../exec";
import { addButtonDefinition, type ExecutionContext, getButtonDefinition, popOrigin, pushOrigin } from "../exec.context";
import { evalExpression, evalExpressionAs } from "../expr.eval";

export function executeButtonCommand(command: TNeatButtonCommand, context: ExecutionContext) {
	if (isButtonDefineCommand(command)) return addButtonDefinition(command.id, command.body, context);
	return inlineButton(command, context);
}

function inlineButton(command: TNeatButtonInstantiationWithBodyCommand | TNeatButtonInstantiationWithoutBodyCommand, context: ExecutionContext) {
	const gc = context.gc as GameContext;
	const buttonObj: ButtonDTO = {
		x: evalExpressionAs(command.at.x, context, "number"),
		y: evalExpressionAs(command.at.y, context, "number"),
		width: 0,
		height: 0,
		selectionRect: new BBox(0, 0, 0, 0),
	};

	if (command.size) {
		buttonObj.width = evalExpressionAs(command.size.width, context, "number");
		buttonObj.height = evalExpressionAs(command.size.height, context, "number");
	}

	let statements: TNeatCommand[] | undefined;
	if (command.body) statements = command.body;
	else {
		statements = getButtonDefinition(command.id, context);
		if (!statements) throw new Error(`Button ${command.id} not found`);
	}

	const entity = new ButtonEntity(buttonObj);
	if (command.id) entity.id = command.id;
	gc.scene?.addTask(Events.TASK_ADD_ENTITY, entity);

	const content = (command as TNeatButtonInstantiationWithoutBodyCommand).content;
	if (content) context.variables.setLocal("content", evalExpression(content, context));

	pushOrigin(buttonObj.x, buttonObj.y, context);
	const buttonItems = runCommands(statements, context) as Entity[];
	popOrigin(context);

	if (content) context.variables.deleteLocal("content");

	entity.selectionRect = getBoundingBox(gc, buttonItems);
	if (command.pad) {
		const padding = [evalExpressionAs(command.pad[0], context, "number"), evalExpressionAs(command.pad[1], context, "number")];
		entity.selectionRect.inflate(padding[0], padding[1]);
	}

	// if (command.anims) addAnims(command.anims, entity, context);

	gc.scene?.on(Events.BUTTON_CLICKED, (entity) => {
		gc.scene?.emit(Symbol.for(command.trigger), entity);
	});

	return entity;
}

export function isButtonDefineCommand(cmd: TNeatButtonCommand): cmd is TNeatButtonDefineCommand {
	return typeof cmd.id === "string" && Array.isArray(cmd.body) && !("trigger" in cmd) && !("at" in cmd);
}

// export function isButtonInstanciationWithBody(cmd: TNeatButtonCommand): cmd is TNeatButtonInstantiationWithBodyCommand {
// 	return "trigger" in cmd && typeof cmd.trigger === "string" && !!cmd.at && Array.isArray(cmd.body);
// }

// export function isButtonInstanciationWithoutBody(cmd: TNeatButtonCommand): cmd is TNeatButtonInstantiationWithoutBodyCommand {
// 	return "trigger" in cmd && typeof cmd.trigger === "string" && !!cmd.at && !("body" in cmd) && typeof cmd.id === "string";
// }
