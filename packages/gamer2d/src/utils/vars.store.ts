import { type Signal, effect, memo, signal, staticSignal } from "./signals.util";

type Scope = "local" | "global" | "auto";

const globals = new Map<string, Signal<unknown>>();

export class NeatVariableStore<T = unknown> {
	private localStore: Map<string, Signal<unknown>>;
	private globalStore = globals;

	constructor(isGlobalOnly = false) {
		if (isGlobalOnly) this.localStore = globals;
		else this.localStore = new Map<string, Signal<unknown>>();
	}

	// === GETTERS ===

	/**
	 * Get value with scope resolution: local first, then global
	 */
	get(key: string) {
		const sig = this.getSignal(key);
		return sig?.value;
	}
	/**
	 * Get value from specific scope
	 */
	getLocal(key: string) {
		return this.localStore.get(key)?.value;
	}
	getGlobal(key: string) {
		return this.globalStore.get(key)?.value;
	}

	/**
	 * Get signal with scope resolution: local first, then global
	 */
	getSignal(key: string) {
		return this.localStore.get(key) ?? this.globalStore.get(key);
	}

	/**
	 * Get signal from specific scope
	 */
	getLocalSignal(key: string) {
		return this.localStore.get(key);
	}
	getGlobalSignal(key: string) {
		return this.globalStore.get(key);
	}

	// === SETTERS ===

	/**
	 * Set value with intelligent scoping:
	 * - If variable exists locally, update local
	 * - If variable exists globally but not locally, update global
	 * - If variable doesn't exist anywhere, create in local scope
	 */
	set(key: string, value: T): void {
		const localSig = this.localStore.get(key);
		const globalSig = this.globalStore.get(key);

		if (localSig) {
			// Local exists, update it
			localSig.value = value;
		} else if (globalSig) {
			// Only global exists, update global
			globalSig.value = value;
		} else {
			// Doesn't exist anywhere, create local
			this.localStore.set(key, signal(value));
		}
	}

	/**
	 * Set value in specific scope
	 */
	setLocal(key: string, value: T): void {
		const existing = this.localStore.get(key);
		if (existing) existing.value = value;
		else this.localStore.set(key, signal(value));
	}
	setStaticLocal(key: string, value: T): void {
		const existing = this.localStore.get(key);
		if (existing) existing.value = value;
		else this.localStore.set(key, staticSignal(value));
	}
	setGlobal(key: string, value: T): void {
		const existing = this.globalStore.get(key);
		if (existing) existing.value = value;
		else this.globalStore.set(key, signal(value));
	}

	/**
	 * Set signal in specific scope
	 */
	setLocalSignal(key: string, sig: Signal<T>): void {
		this.localStore.set(key, sig);
	}
	setGlobalSignal(key: string, sig: Signal<T>): void {
		this.globalStore.set(key, sig);
	}

	// === EXISTENCE CHECKS ===

	has(key: string) {
		return this.localStore.has(key) || this.globalStore.has(key);
	}
	hasLocal(key: string) {
		return this.localStore.has(key);
	}
	hasGlobal(key: string) {
		return this.globalStore.has(key);
	}

	/**
	 * Returns the scope where the variable is found
	 */
	getScope(key: string): "local" | "global" | null {
		if (this.localStore.has(key)) return "local";
		if (this.globalStore.has(key)) return "global";
		return null;
	}

	// === DELETION ===

	delete(key: string) {
		const localDeleted = this.localStore.delete(key);
		const globalDeleted = this.globalStore.delete(key);
		return localDeleted || globalDeleted;
	}
	deleteLocal(key: string) {
		return this.localStore.delete(key);
	}
	deleteGlobal(key: string) {
		return this.globalStore.delete(key);
	}

	// === REACTIVE METHODS ===

	watch(key: string, callback: (value: unknown, scope: "local" | "global") => void): (() => void) | undefined {
		const sig = this.getSignal(key);
		if (!sig) return undefined;

		const scope = this.getScope(key);
		if (!scope) return undefined;
		effect(() => callback(sig.value, scope));

		return () => {
			console.log(`Cleanup watch for ${key}`);
		};
	}

	computed<R>(key: string, computation: (value: unknown) => R): Signal<R> | undefined {
		const sig = this.getSignal(key);
		if (!sig) return undefined;

		return memo(() => computation(sig.value));
	}

	/**
	 * Clear all local variables
	 */
	clearLocal(): void {
		this.localStore.clear();
	}

	/**
	 * Clear all global variables
	 */
	clearGlobal(): void {
		this.globalStore.clear();
	}

	/**
	 * Clear all variables
	 */
	clear(): void {
		this.localStore.clear();
		this.globalStore.clear();
	}

	// === UTILITY METHODS ===

	/**
	 * Get all keys from both scopes (locals override globals)
	 */
	keys(): string[] {
		const globalKeys = Array.from(this.globalStore.keys());
		const localKeys = Array.from(this.localStore.keys());

		// Merge, with locals taking precedence
		const allKeys = new Set([...globalKeys, ...localKeys]);
		return Array.from(allKeys);
	}

	/**
	 * Get keys from specific scope
	 */
	keysFromScope(scope: "local" | "global"): string[] {
		const store = scope === "local" ? this.localStore : this.globalStore;
		return Array.from(store.keys());
	}

	/**
	 * Get all resolved values (with scope resolution)
	 */
	values() {
		return this.keys().map((key) => this.get(key));
	}

	/**
	 * Get all resolved entries (with scope resolution)
	 */
	entries() {
		return this.keys().map((key) => [key, this.get(key)]);
	}

	/**
	 * Get entries with scope information
	 */
	entriesWithScope() {
		return this.keys().map((key) => [key, this.get(key), this.getScope(key)]);
	}

	// === BATCH OPERATIONS ===

	setBatch(updates: Record<string, T>, scope: Scope = "auto"): void {
		for (const [key, value] of Object.entries(updates)) {
			switch (scope) {
				case "local":
					this.setLocal(key, value);
					break;
				case "global":
					this.setGlobal(key, value);
					break;
				case "auto":
					this.set(key, value);
					break;
			}
		}
	}

	// === DEBUG ===

	debug(): void {
		console.log("=== Signal Store Debug ===");
		console.log("Local variables:", Object.fromEntries(Array.from(this.localStore.entries()).map(([k, v]) => [k, v.value])));
		console.log("Global variables:", Object.fromEntries(Array.from(this.globalStore.entries()).map(([k, v]) => [k, v.value])));
		console.log("Resolved scope:", Object.fromEntries(this.entriesWithScope()));
	}
}

// Factory function
export function createVariableStore<T = unknown>(isGlobalOnly = false): NeatVariableStore<T> {
	return new NeatVariableStore<T>(isGlobalOnly);
}
