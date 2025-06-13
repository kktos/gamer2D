export class TFunctions extends Map<string, (...args: unknown[]) => unknown> {
	call(name: string, args: unknown[]): unknown {
		const fn = this.get(name);
		if (!fn) throw new Error(`Function not found: ${name}`);
		return fn(...args);
	}
}
