import type { ExecutionContext } from "../exec.context";

export function fnLog(context: ExecutionContext, ...args) {
	console.log(...args);
}
