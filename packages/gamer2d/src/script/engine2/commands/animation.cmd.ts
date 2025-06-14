import type { TNeatSpriteCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";
import { evalExpression } from "../expr.eval";

export function executeAnimationCommand(command: TNeatSpriteCommand, context: ExecutionContext) {
	const x = evalExpression(command.at.x, context);
	const y = evalExpression(command.at.y, context);
	const width = command.size ? evalExpression(command.size.width, context) : undefined;
	const height = command.size ? evalExpression(command.size.height, context) : undefined;

	// context.renderer.drawRect(x, y, width, height, padding);
}
