type Listener<T> = (value: T) => void;

export class Signal<T> {
	private _value: T;
	private listeners = new Set<Listener<T>>();

	static create<T>(initial?: T) {
		return new Signal<T | undefined>(initial);
	}

	constructor(initial: T) {
		this._value = initial;
	}

	get value() {
		return this._value;
	}
	set value(val: T) {
		if (this._value !== val) {
			this._value = val;
			for (const fn of this.listeners) fn(val);
		}
	}

	subscribe(fn: Listener<T>) {
		this.listeners.add(fn);
		return () => this.listeners.delete(fn);
	}

	notify() {
		for (const fn of this.listeners) fn(this._value);
	}
}
