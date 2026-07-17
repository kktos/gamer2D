import { Events } from "../../../events";
import { evalExpression } from "../expr.eval";
import { TNeatEmitCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.context";

export function executeEmitCommand(command: TNeatEmitCommand, context: ExecutionContext) {
	const params = command.params.map((param) => evalExpression(param, context));
	context.currentScene?.addTask(Events.TASK_EMIT_EVENT, command.event, ...params);
}
