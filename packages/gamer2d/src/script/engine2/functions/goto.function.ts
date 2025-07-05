import type { ExecutionContext } from "../exec.type";

export function fnGoto(context: ExecutionContext, ...args: unknown[]) {
	const page = args[0] as string;
	const scene = context.currentScene;
	return scene?.goto(page);
}
