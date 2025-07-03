import type { ExecutionContext } from "../exec.type";
import { fnEntity } from "./entity.function";
import { fnLog } from "./log.function";
import { fnInt, fnRandom } from "./math.function";

export class NeatFunctions extends Map<string, (context: ExecutionContext, ...args: unknown[]) => unknown> {
	call(context: ExecutionContext, name: string, args: unknown[]): unknown {
		const fn = this.get(name);
		if (!fn) throw new Error(`Function not found: ${name}`);
		return fn(context, ...args);
	}
}

export const functions = new NeatFunctions();

export function addFunction(name: string | string[], fn: (context: ExecutionContext, ...args: unknown[]) => unknown) {
	if (Array.isArray(name)) {
		for (const n of name) {
			functions.set(n, fn);
		}
		return;
	}
	functions.set(name, fn);
}

addFunction("log", fnLog);
addFunction("entity", fnEntity);
addFunction(["random", "rand", "rnd"], fnRandom);
addFunction("int", fnInt);
