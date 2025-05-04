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

const reactiveStack: Effect[] = [];
let tracking = true;
let batchState: BatchState = {
	active: false,
};
const getCurrentObserver = () => tracking && reactiveStack.at(-1);

export function signal<T>(_value: T) {
	let value = _value;

	const subscribers = new Set<Effect>();
	const getter = () => {
		const subscriber = getCurrentObserver();
		if (subscriber) subscribers.add(subscriber);
		return value;
	};
	const setter = (val: T) => {
		if (val === value) return;
		value = val;
		for (const s of subscribers) s.execute();
	};
	return Object.assign(getter, { set: setter });
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

export function memo<T>(fn: () => T): () => T {
	let _signal: ReturnType<typeof signal<T>>;
	effect(() => {
		const value = fn();
		if (_signal) _signal.set(value);
		else _signal = signal(value);
	});
	return () => _signal();
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

export const on = <T>(signal: () => T, fn: (v: T) => void) => {
	return () => {
		const value = signal();
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
