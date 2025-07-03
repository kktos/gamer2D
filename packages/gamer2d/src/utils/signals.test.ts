import { describe, expect, it } from "vitest";

import { batch, effect, memo, onCleanup, signal, untrack } from "./signals.util";

describe("Signals System", () => {
	// Helper to run effects and track executions
	const createEffectTracker = (fn: () => void) => {
		let executions = 0;
		let lastValue: unknown;
		const runner = effect(() => {
			executions++;
			lastValue = fn();
		});
		return {
			get executions() {
				return executions;
			},
			get lastValue() {
				return lastValue;
			},
			runner,
		};
	};

	describe("signal", () => {
		it("should create a signal with an initial value", () => {
			const count = signal(0);
			expect(count.value).toBe(0);
		});

		it("should set and get the signal value", () => {
			const count = signal(0);
			count.value = 5;
			expect(count.value).toBe(5);
		});

		it("should trigger effects when the value changes", () => {
			const count = signal(0);
			let dummy: number | undefined;
			const tracker = createEffectTracker(() => {
				dummy = count.value;
			});

			expect(tracker.executions).toBe(1);
			expect(dummy).toBe(0);

			count.value = 10;
			expect(tracker.executions).toBe(2);
			expect(dummy).toBe(10);

			count.value = 10;
			expect(tracker.executions).toBe(2);
			expect(dummy).toBe(10);
		});
	});

	describe("effect", () => {
		it("should run immediately upon creation", () => {
			let ran = false;
			effect(() => {
				ran = true;
			});
			expect(ran).toBe(true);
		});

		it("should re-run when a dependency signal changes", () => {
			const sig = signal("a");
			const tracker = createEffectTracker(() => sig.value);

			expect(tracker.executions).toBe(1);
			expect(tracker.lastValue).toBe("a");

			sig.value = "b";
			expect(tracker.executions).toBe(2);
			expect(tracker.lastValue).toBe("b");
		});

		it.skip("should only subscribe to signals accessed within the effect", () => {
			const sigA = signal("A");
			const sigB = signal("B");
			const condition = signal(true);

			let value: string | undefined;
			const tracker = createEffectTracker(() => {
				value = condition.value ? sigA.value : sigB.value;
			});

			expect(tracker.executions).toBe(1);
			expect(value).toBe("A");

			// Change sigB - should not trigger effect yet
			sigB.value = "B2";
			expect(tracker.executions).toBe(1);
			expect(value).toBe("A");

			// Change sigA - should trigger effect
			sigA.value = "A2";
			expect(tracker.executions).toBe(2);
			expect(value).toBe("A2");

			// Change condition - should trigger effect and change dependency
			condition.value = false;
			expect(tracker.executions).toBe(3);
			expect(value).toBe("B2"); // Now reads from sigB

			// Change sigA - should not trigger effect now
			sigA.value = "A3";
			expect(tracker.executions).toBe(3);
			expect(value).toBe("B2");

			// Change sigB - should trigger effect now
			sigB.value = "B3";
			expect(tracker.executions).toBe(4);
			expect(value).toBe("B3");
		});
	});

	describe("memo", () => {
		it("should compute the value lazily and cache it", () => {
			const sigA = signal(1);
			const sigB = signal(2);
			let computations = 0;

			const sum = memo(() => {
				computations++;
				return sigA.value + sigB.value;
			});

			expect(computations).toBe(1); // Initial computation due to effect in memo
			expect(sum.value).toBe(3);
			expect(computations).toBe(1); // Should not recompute on read

			sigA.value = 5;
			expect(computations).toBe(2); // Recomputes when dependency changes
			expect(sum.value).toBe(7);
			expect(computations).toBe(2); // Cached again

			sigB.value = 10;
			expect(computations).toBe(3);
			expect(sum.value).toBe(15);
			expect(computations).toBe(3);
		});

		it("should trigger effects when its value changes", () => {
			const sig = signal(1);
			const double = memo(() => sig.value * 2);
			const tracker = createEffectTracker(() => double.value);

			expect(tracker.executions).toBe(1);
			expect(tracker.lastValue).toBe(2);

			sig.value = 5;
			expect(tracker.executions).toBe(2);
			expect(tracker.lastValue).toBe(10);
		});
	});

	describe("untrack", () => {
		it("should prevent dependency tracking within its scope", () => {
			const sigA = signal("A");
			const sigB = signal("B");
			const tracker = createEffectTracker(() => {
				untrack(() => sigA.value); // Read sigA without tracking
				return sigB.value; // Track sigB
			});

			expect(tracker.executions).toBe(1);
			expect(tracker.lastValue).toBe("B");

			// Change sigA - should NOT trigger effect
			sigA.value = "A2";
			expect(tracker.executions).toBe(1);

			// Change sigB - should trigger effect
			sigB.value = "B2";
			expect(tracker.executions).toBe(2);
			expect(tracker.lastValue).toBe("B2");
		});
	});

	describe("onCleanup", () => {
		it("should run cleanup function before effect re-runs", () => {
			const sig = signal(0);
			let cleanupCount = 0;

			const tracker = createEffectTracker(() => {
				sig.value; // Depend on signal
				onCleanup(() => {
					cleanupCount++;
				});
			});

			expect(tracker.executions).toBe(1);
			expect(cleanupCount).toBe(0);

			sig.value = 1;
			expect(cleanupCount).toBe(1); // Cleanup ran before second execution
			expect(tracker.executions).toBe(2);

			sig.value = 2;
			expect(cleanupCount).toBe(2); // Cleanup ran before third execution
			expect(tracker.executions).toBe(3);
		});
	});

	describe("batch", () => {
		it("should run effects only once after multiple updates within the batch", () => {
			const sigA = signal(1);
			const sigB = signal(2);
			const tracker = createEffectTracker(() => sigA.value + sigB.value);

			expect(tracker.executions).toBe(1);

			batch(() => {
				sigA.value = 5;
				sigB.value = 10;
				expect(tracker.executions).toBe(1); // Effect shouldn't run yet
			});

			expect(tracker.executions).toBe(2); // Effect runs once after batch
			expect(tracker.lastValue).toBe(15);
		});

		it("should throw if nested (as per current implementation)", () => {
			expect(() => {
				batch(() => {
					batch(() => {});
				});
			}).toThrow("No support yet");
		});
	});
});
