import type { ExecutionContext } from "../exec.type";

export function fnLog(context: ExecutionContext, ...args) {
	console.log(...args);
}
