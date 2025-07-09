import type { ExecutionContext } from "../exec.context";
export function fnTimer(context: ExecutionContext, ...args: unknown[]) {
	const id = args[0] as string;
	const scene = context.currentScene;
	return scene?.timers?.get(id);
}
