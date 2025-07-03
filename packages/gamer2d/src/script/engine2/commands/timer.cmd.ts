import { Events } from "../../../events";
import { Timers } from "../../../layers";
import type { TNeatTimerCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.type";
import { evalExpressionAs } from "../expr.eval";

export function executeTimerCommand(command: TNeatTimerCommand, context: ExecutionContext) {
	if (!context.currentScene) throw new Error("No scene");
	const scene = context.currentScene;

	if (!context.currentScene.timers) {
		context.currentScene.timers = new Timers((name: string, count: number) => {
			scene.emit(Events.EVENT_TIMER, name, count);
		});
	}

	const duration = evalExpressionAs(command.duration, context, "number");
	const timers = context.currentScene.timers;

	timers.add(command.id, duration, command.isRepeating ? Number.MAX_SAFE_INTEGER : 1);
}
