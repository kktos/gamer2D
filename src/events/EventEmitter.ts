type EventCallback = (...args: unknown[]) => void;

export class EventEmitter {
	private events: Map<symbol, EventCallback[]>;

	constructor() {
		this.events = new Map();
	}

	on(name: symbol, listener: EventCallback) {
		if (!this.events.get(name)) {
			this.events.set(name, []);
		}

		this.events.get(name)?.push(listener);
	}

	off(name: symbol, listenerToRemove: EventCallback) {
		const cbList = this.events.get(name);
		if (!cbList) {
			throw new Error(`Can't remove a listener. Event "${String(name)}" doesn't exits.`);
		}

		const filterListeners = (listener: EventCallback) => listener !== listenerToRemove;
		this.events.set(name, cbList.filter(filterListeners));
	}

	emit(name: symbol, ...args: unknown[]) {
		const cbList = this.events.get(name);
		if (!cbList) {
			// throw new Error(`Can't emit an event. Event "${String(name)}" doesn't exits.`);
			return;
		}

		for (const callback of cbList) {
			callback(...args);
		}
		// this._events[name].forEach((callback) => callback(...args));
	}
}
