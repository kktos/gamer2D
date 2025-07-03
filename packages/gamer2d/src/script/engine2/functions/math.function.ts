import type { ExecutionContext } from "../exec.type";

export function fnRandom(context: ExecutionContext, ...args: unknown[]) {
	const from = args[0] as number;
	const to = args[1] as number;
	return Math.random() * to + from;
}

export function fnInt(context: ExecutionContext, ...args: unknown[]) {
	const num = args[0] as number;
	return Math.floor(num);
}
