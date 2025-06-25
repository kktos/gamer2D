import type { TNeatSpriteCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";
import { evalExpression } from "../expr.eval";

export function executePoolCommand(command: TNeatSpriteCommand, context: ExecutionContext) {
	const _x = evalExpression(command.at.x, context);
	const _y = evalExpression(command.at.y, context);
	const _width = command.size ? evalExpression(command.size.width, context) : undefined;
	const _height = command.size ? evalExpression(command.size.height, context) : undefined;

	// context.renderer.drawRect(x, y, width, height, padding);
}
