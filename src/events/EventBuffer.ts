export type EventCallback = (...args: unknown[]) => void;

export class EventBuffer {
	private events: { name: symbol; args: unknown[] }[];

	constructor() {
		this.events = [];
	}

	emit(name: symbol, ...args: unknown[]) {
		const event = { name, args };
		this.events.push(event);
	}

	process(name: symbol | string, callback: EventCallback) {
		for (let idx = 0; idx < this.events.length; idx++) {
			const event = this.events[idx];
			if (event.name === name || name === "*") {
				callback(...event.args);
			}
		}
	}

	clear() {
		this.events.length = 0;
	}
}
