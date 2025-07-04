import type { TNeatSettingsCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";

export function executeSettingsCommand(command: TNeatSettingsCommand, context: ExecutionContext) {
	// const _x = evalExpression(command.at.x, context);
	// const _y = evalExpression(command.at.y, context);
	// const _width = evalExpression(command.size.width, context);
	// const _height = evalExpression(command.size.height, context);
	return { type: "SETTINGS", value: command.value };
}
