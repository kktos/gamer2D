export class EventEmitter {
	private listeners: Map<string | symbol, ((data: unknown) => void)[]> = new Map();

	public on(event: string | symbol, handler: (data: unknown) => void): void {
		if (this.listeners.has(event)) {
			const handlers = this.listeners.get(event);
			if (handlers) handlers.push(handler);
		} else {
			this.listeners.set(event, [handler]);
		}
	}

	public emit(event: string | symbol, data: unknown): void {
		if (!this.listeners.has(event)) return;
		const handlers = this.listeners.get(event);
		if (handlers) for (const handler of handlers) handler(data);
	}
}
