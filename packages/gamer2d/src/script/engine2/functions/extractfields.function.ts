import type { ExecutionContext } from "../exec.context";

export function fnExtractFields<T>(_context: ExecutionContext, ...args: unknown[]) {
	const array = args[0] as T[];
	const path = args[1] as string;

	return array.map((obj) => {
		const keys = path.split(".");
		let current: unknown = obj;

		for (const key of keys) {
			if (current === null || current === undefined) {
				return undefined;
			}
			current = current[key];
		}

		return current;
	});
}
