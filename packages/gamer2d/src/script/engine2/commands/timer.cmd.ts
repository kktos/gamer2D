import { Events } from "../../../events";
import { TimerManager } from "../../../utils/timermanager.class";
import type { TNeatTimerCommand } from "../../compiler2/types/commands.type";
import type { ExecutionContext } from "../exec.context";
import { evalExpression } from "../expr.eval";

export function executeTimerCommand(command: TNeatTimerCommand, context: ExecutionContext) {
	if (!context.currentScene) throw new Error("No scene");
	const scene = context.currentScene;

	if (!context.currentScene.timers) {
		context.currentScene.timers = new TimerManager((name: string, count: number) => {
			scene.emit(Events.EVENT_TIMER, name, count);
		});
	}

	const duration = evalExpression(command.duration, context);

	const timers = context.currentScene.timers;
	if (command.kind === "schedule") {
		if (!Array.isArray(duration)) throw new TypeError("Timer at needs an array of durations");
		if (!duration.every((d) => typeof d === "number")) throw new TypeError("Timer at needs an array of numbers");

		timers.addArray(
			command.id,
			duration.map((d) => d * command.timeScale),
		);
	} else {
		if (typeof duration !== "number") throw new TypeError("Timer duration needs to be a number");
		timers.add(command.id, duration * command.timeScale, command.kind === "repeat" ? Number.MAX_SAFE_INTEGER : 1);
	}
}
