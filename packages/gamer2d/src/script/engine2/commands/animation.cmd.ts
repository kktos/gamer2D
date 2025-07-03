import type { TAnimationPathPathDTO } from "../../../traits/animation_path.trait";
import type { TNeatAnimationCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";
import { evalExpressionAs } from "../expr.eval";

export function executeAnimationCommand(command: TNeatAnimationCommand, context: ExecutionContext) {
	const repeat = command.repeat ? evalExpressionAs(command.repeat, context, "number") : 1;
	const animDef: TAnimationPathPathDTO = {
		name: command.name,
		repeat,
		hasAutostart: !command.isPaused,
		statements: command.statements,
	};
	context.variables.setStaticLocal(command.name, animDef);
}
