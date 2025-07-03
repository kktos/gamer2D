type Effect = {
	execute: () => void;
	cleanups?: Cleanup[];
};
type BatchState =
	| {
			active: false;
	  }
	| { active: true; queue: Effect[] };
type Cleanup = () => void;

export type Signal<T> = {
	get value(): T;
	set value(val: T);
};

const reactiveStack: Effect[] = [];
let tracking = true;
let batchState: BatchState = {
	active: false,
};
const getCurrentObserver = () => tracking && reactiveStack.at(-1);

export function signal<T>(_value: T) {
	let value = _value;
	const subscribers = new Set<Effect>();
	const signalObj = {
		__signal__: true,
		get value() {
			const subscriber = getCurrentObserver();
			if (subscriber) subscribers.add(subscriber);
			return value;
		},
		set value(val: T) {
			if (val === value) return;
			value = val;
			for (const s of subscribers) s.execute();
		},
	};
	return signalObj as Signal<T>;
}

export function staticSignal<T>(_value: T) {
	let value = _value;
	const signalObj = {
		__signal__: true,
		get value() {
			return value;
		},
		set value(val: T) {
			if (val === value) return;
			value = val;
		},
	};
	return signalObj as Signal<T>;
}

export function onCleanup(callback: () => void): void {
	const observer = getCurrentObserver();
	if (!observer) throw new Error("System Error");
	if (!observer.cleanups) observer.cleanups = [];
	observer.cleanups.push(callback);
}

export function effect(callback: () => void): void {
	const execute = () => {
		reactiveStack.push(subscriber);
		try {
			if (batchState.active) batchState.queue.push(subscriber);
			else {
				for (const cleanup of subscriber.cleanups ?? []) cleanup();
				subscriber.cleanups = [];
				// TODO cleanup all next in order of reactive stack + reexecute them
				batch(callback);
			}
		} finally {
			reactiveStack.pop();
		}
	};
	const subscriber: Effect = { execute };
	execute();
}

export function memo<T>(fn: () => T): Signal<T> {
	let _signal: Signal<T>;
	effect(() => {
		const value = fn();
		if (_signal) _signal.value = value;
		else _signal = signal(value);
	});
	// biome-ignore lint/style/noNonNullAssertion: no choice
	return _signal!;
}

export const untrack = <T>(fn: () => T): T => {
	let value: T;
	const temp = tracking;
	tracking = false;
	try {
		value = fn();
	} finally {
		tracking = temp;
	}
	return value;
};

export const on = <T>(signal: Signal<T>, fn: (v: T) => void) => {
	return () => {
		const value = signal.value;
		untrack(() => fn(value));
	};
};

export function batch<T>(fn: () => T): T {
	if (batchState.active) throw new Error("No support yet");
	batchState = {
		active: true,
		queue: [],
	};
	let value: T;
	try {
		value = fn();
	} finally {
		const { queue } = batchState;
		batchState = { active: false };
		const executed = new Set<Effect>();
		for (const effect of queue) {
			if (executed.has(effect)) continue;
			executed.add(effect);
			effect.execute();
		}
	}
	return value;
}

export function createRoot(callback: () => void): Cleanup {
	const execute = () => {
		reactiveStack.push(effect);
		try {
			callback();
		} finally {
			reactiveStack.pop();
		}
	};
	const effect: Effect = { execute };
	execute();
	return () => {
		for (const cleanup of effect.cleanups ?? []) cleanup();
		effect.cleanups = [];
	};
}
