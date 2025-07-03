import { batch, effect, memo } from "./signals.util";
import { type NeatVariableStore, createVariableStore } from "./vars.store";

type InterpolationResult = {
	result: string;
	dependencies: string[];
};

type PerformanceOptions = {
	debounceMs?: number;
	batchUpdates?: boolean;
	highFrequencyVars?: string[]; // Variables that change frequently (like mouseX, mouseY)
};

export class ReactiveInterpolator {
	private store: NeatVariableStore;
	private defaultOptions: PerformanceOptions;
	private debounceTimers = new Map<string, number>();
	private batchedUpdates = new Set<() => void>();
	private batchTimer?: number;

	constructor(store: NeatVariableStore, defaultOptions: PerformanceOptions = {}) {
		this.store = store;
		this.defaultOptions = {
			debounceMs: 16, // ~60fps
			batchUpdates: true,
			highFrequencyVars: ["mouseX", "mouseY", "deltaTime", "frameCount"],
			...defaultOptions,
		};
	}

	/**
	 * Interpolate a string and track which variables were accessed
	 */
	interpolateWithTracking(template: string): InterpolationResult {
		const dependencies: string[] = [];
		const variableRegex = /\$\{([^}]+)\}/g;

		const result = template.replace(variableRegex, (match, varName) => {
			const trimmedName = varName.trim();

			// Track this dependency
			if (!dependencies.includes(trimmedName)) {
				dependencies.push(trimmedName);
			}

			// Get the value
			const value = this.store.get(trimmedName);
			return value !== undefined ? String(value) : match; // Keep original if not found
		});

		return { result, dependencies };
	}

	/**
	 * Create a reactive text with performance optimizations
	 */
	createReactiveText(template: string, onUpdate: (newText: string) => void, options: PerformanceOptions = {}): () => void {
		const opts = { ...this.defaultOptions, ...options };
		let currentDependencies: string[] = [];
		let cleanup: (() => void) | undefined;
		let lastResult = "";

		const updateText = () => {
			const { result, dependencies } = this.interpolateWithTracking(template);

			// Check if dependencies changed
			const depsChanged = !this.arraysEqual(currentDependencies, dependencies);

			if (depsChanged) {
				// Clean up old effect
				if (cleanup) cleanup();

				// Set up new effect with current dependencies
				currentDependencies = [...dependencies];

				if (dependencies.length > 0) {
					cleanup = this.watchMultiple(dependencies, () => this.handleUpdate(template, onUpdate, opts), opts);
				}
			}

			// Update with current result (only if different)
			if (result !== lastResult) {
				lastResult = result;
				onUpdate(result);
			}
		};

		// Initial update
		updateText();

		// Return cleanup function
		return () => {
			if (cleanup) cleanup();
			this.clearDebounceTimers();
		};
	}

	/**
	 * Handle update with performance optimizations
	 */
	private handleUpdate(template: string, onUpdate: (newText: string) => void, options: PerformanceOptions): void {
		const updateFn = () => {
			const { result } = this.interpolateWithTracking(template);
			onUpdate(result);
		};

		if (options.batchUpdates) {
			this.addToBatch(updateFn);
		} else if (options.debounceMs && options.debounceMs > 0) {
			this.debounce("update", updateFn, options.debounceMs);
		} else {
			updateFn();
		}
	}

	/**
	 * Debounce function calls
	 */
	private debounce(key: string, fn: () => void, delay: number): void {
		// Clear existing timer
		const existingTimer = this.debounceTimers.get(key);
		if (existingTimer) {
			clearTimeout(existingTimer);
		}

		// Set new timer
		const timer = setTimeout(() => {
			fn();
			this.debounceTimers.delete(key);
		}, delay) as unknown as number;

		this.debounceTimers.set(key, timer);
	}

	/**
	 * Add update to batch
	 */
	private addToBatch(updateFn: () => void): void {
		this.batchedUpdates.add(updateFn);

		// Schedule batch execution if not already scheduled
		if (!this.batchTimer) {
			this.batchTimer = requestAnimationFrame(() => {
				this.flushBatch();
			}) as unknown as number;
		}
	}

	/**
	 * Execute all batched updates
	 */
	private flushBatch(): void {
		if (this.batchedUpdates.size > 0) {
			// Use your signals batch function if available
			batch(() => {
				for (const updateFn of this.batchedUpdates) {
					updateFn();
				}
			});

			this.batchedUpdates.clear();
		}
		this.batchTimer = undefined;
	}

	/**
	 * Clear all debounce timers
	 */
	private clearDebounceTimers(): void {
		for (const timer of this.debounceTimers.values()) {
			clearTimeout(timer);
		}
		this.debounceTimers.clear();
	}

	/**
	 * Watch multiple variables with smart performance handling
	 */
	private watchMultiple(variables: string[], callback: () => void, options: PerformanceOptions): () => void {
		const cleanups: (() => void)[] = [];
		const highFreq = options.highFrequencyVars || [];

		// Separate high-frequency and low-frequency variables
		const highFrequencyVars = variables.filter((v) => highFreq.includes(v));
		const lowFrequencyVars = variables.filter((v) => !highFreq.includes(v));

		// Handle low-frequency variables (immediate updates)
		for (const varName of lowFrequencyVars) {
			const signal = this.store.getSignal(varName);
			if (signal) {
				effect(() => {
					signal.value; // Access to track dependency
					callback();
				});

				cleanups.push(() => {
					console.log(`Cleanup watch for ${varName}`);
				});
			}
		}

		// Handle high-frequency variables (debounced/batched)
		if (highFrequencyVars.length > 0) {
			for (const varName of highFrequencyVars) {
				const signal = this.store.getSignal(varName);
				if (signal) {
					effect(() => {
						signal.value; // Access to track dependency

						// Apply performance optimization for high-frequency vars
						if (options.batchUpdates) {
							this.addToBatch(callback);
						} else if (options.debounceMs && options.debounceMs > 0) {
							this.debounce(`highfreq-${varName}`, callback, options.debounceMs);
						} else {
							callback();
						}
					});

					cleanups.push(() => {
						console.log(`Cleanup high-freq watch for ${varName}`);
					});
				}
			}
		}

		return () => {
			for (const cleanup of cleanups) {
				cleanup();
			}
		};
	}

	private watchMultipleStrategy(variables: string[], callback: () => void, options: PerformanceOptions): () => void {
		const highFreq = options.highFrequencyVars || [];

		// Create memo that computes current state of all variables
		const allVariablesMemo = memo(() =>
			variables.reduce(
				(acc, varName) => {
					const signal = this.store.getSignal(varName);
					acc[varName] = signal ? signal.value : undefined;
					return acc;
				},
				{} as Record<string, unknown>,
			),
		);

		// Determine update strategy based on variables involved
		const shouldUseHighFreqStrategy = variables.some((v) => highFreq.includes(v));

		const executeCallback = shouldUseHighFreqStrategy ? this.createHighFreqStrategy(callback, options) : callback;

		// Single effect watching the memo
		effect(() => {
			allVariablesMemo.value; // Create dependency
			executeCallback();
		});

		return () => {
			console.log(`Cleanup strategy memo for variables: ${variables.join(", ")}`);
		};
	}

	private createHighFreqStrategy(callback: () => void, options: PerformanceOptions): () => void {
		return () => {
			if (options.batchUpdates) {
				this.addToBatch(callback);
			} else if (options.debounceMs && options.debounceMs > 0) {
				this.debounce("strategy-batch", callback, options.debounceMs);
			} else {
				callback();
			}
		};
	}

	/**
	 * Utility to compare arrays
	 */
	private arraysEqual(a: string[], b: string[]): boolean {
		return a.length === b.length && a.every((val, i) => val === b[i]);
	}
}

// Enhanced Text Entity class with performance options
export class ReactiveTextEntity {
	private element: HTMLElement;
	private interpolator: ReactiveInterpolator;
	private cleanup?: () => void;
	private template = "";
	private performanceOptions: PerformanceOptions;

	constructor(element: HTMLElement, store: NeatVariableStore, performanceOptions: PerformanceOptions = {}) {
		this.element = element;
		this.performanceOptions = performanceOptions;
		this.interpolator = new ReactiveInterpolator(store, performanceOptions);
	}

	setText(template: string, options?: PerformanceOptions): void {
		// Clean up previous reactive binding
		if (this.cleanup) {
			this.cleanup();
		}

		this.template = template;
		const opts = { ...this.performanceOptions, ...options };

		// Set up new reactive binding with performance options
		this.cleanup = this.interpolator.createReactiveText(
			template,
			(newText) => {
				this.element.textContent = newText;
				this.requestRedraw();
			},
			opts,
		);
	}

	private requestRedraw(): void {
		// Trigger your game engine's redraw mechanism
		console.log("Requesting redraw for text entity");
		// gameEngine.requestRedraw(this);
	}

	destroy(): void {
		if (this.cleanup) {
			this.cleanup();
		}
	}
}

// Usage in your TEXT command handler with performance options
// export function createTextCommand(command: unknown, context: unknown, store: NeatVariableStore): ReactiveTextEntity {
// 	// Create the HTML element (or your game entity)
// 	const element = document.createElement("div");

// 	// Performance options based on command flags
// 	const performanceOptions: PerformanceOptions = {
// 		debounceMs: command.nocache ? 0 : 16, // No debouncing if nocache
// 		batchUpdates: !command.nocache, // No batching if nocache
// 		highFrequencyVars: ["mouseX", "mouseY", "deltaTime", "frameCount", "scrollX", "scrollY"],
// 	};

// 	// Create reactive text entity with performance options
// 	const textEntity = new ReactiveTextEntity(element, store, performanceOptions);

// 	// Get the template from command (after evaluation)
// 	const template = evalExpressionAs(command.value, context, "string");

// 	// Set up reactive text
// 	textEntity.setText(template);

// 	// Apply other properties (position, size, etc.)
// 	// ... handle 'at', 'size', 'nocache' properties

// 	return textEntity;
// }

// Advanced usage examples
export function performanceExamples() {
	const store = createVariableStore<unknown>();

	// Set up variables
	store.setGlobal("mouseX", 100);
	store.setGlobal("mouseY", 200);
	store.setGlobal("fps", 60);
	store.setGlobal("playerName", "Hero");

	// Example 1: High-performance text for mouse coordinates (debounced)
	const mouseDisplay = document.createElement("div");
	const mouseEntity = new ReactiveTextEntity(mouseDisplay, store, {
		debounceMs: 16, // ~60fps max updates
		batchUpdates: true,
		highFrequencyVars: ["mouseX", "mouseY"],
	});
	mouseEntity.setText("Mouse: (${mouseX}, ${mouseY})");

	// Example 2: Immediate updates for important game state
	const statusDisplay = document.createElement("div");
	const statusEntity = new ReactiveTextEntity(statusDisplay, store, {
		debounceMs: 0, // Immediate updates
		batchUpdates: false,
		highFrequencyVars: [], // Treat all as low-frequency
	});
	statusEntity.setText("Player: ${playerName} | FPS: ${fps}");

	// Example 3: Mixed frequency - player name updates immediately, mouse is debounced
	const mixedDisplay = document.createElement("div");
	const mixedEntity = new ReactiveTextEntity(mixedDisplay, store, {
		debounceMs: 32, // Slower updates for mouse
		batchUpdates: true,
		highFrequencyVars: ["mouseX", "mouseY"], // Only mouse is high-frequency
	});
	mixedEntity.setText("${playerName} at (${mouseX}, ${mouseY})");

	// Simulate rapid mouse updates
	let x = 100;
	let y = 200;
	const mouseUpdateInterval = setInterval(() => {
		x += Math.random() * 10 - 5;
		y += Math.random() * 10 - 5;

		// These will be batched/debounced
		store.setBatch({
			mouseX: Math.round(x),
			mouseY: Math.round(y),
		});
	}, 5); // Very frequent updates (200fps)

	// Simulate occasional important updates
	setTimeout(() => {
		store.set("playerName", "SuperHero"); // Immediate update
	}, 2000);

	setTimeout(() => {
		store.set("fps", 120); // Immediate update
	}, 4000);

	// Cleanup after demo
	setTimeout(() => {
		clearInterval(mouseUpdateInterval);
		mouseEntity.destroy();
		statusEntity.destroy();
		mixedEntity.destroy();
	}, 10000);
}

export function reactiveExpression<T>(evalFn: (varsUsed: Set<string>) => T, store: NeatVariableStore) {
	const varsUsed = new Set<string>();
	evalFn(varsUsed);
	const memoSignal = memo(() => {
		for (const v of varsUsed) {
			const s = store.getSignal(v);
			if (s) s.value;
		}
		return evalFn(varsUsed);
	});
	return memoSignal;
}
