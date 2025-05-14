import { describe, expect, it } from "vitest";
import { ArgVariable } from "../../../../types/value.types";
import { compileScript } from "../../compiler";

describe("On", () => {
	it("should add one handler", () => {
		const script = `
		display "intro" {
			display {
				on test {
					test()
				}
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toHaveProperty("layers");

		const displayLayer = result.layers.find((layer) => layer.type === "display");
		expect(displayLayer).toBeDefined();
		expect(displayLayer).toHaveProperty("on");
		expect(displayLayer.on).toEqual({
			test: {
				action: [[{ name: ["SYSTEM", "test"], args: [] }]],
			},
		});
	});

	it("should add multiples handlers", () => {
		const script = `
		display "intro" {
			display {
				on test {
					test()
				}
				on test2 {
					test2(2)
				}
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toHaveProperty("layers");

		const displayLayer = result.layers.find((layer) => layer.type === "display");
		expect(displayLayer).toBeDefined();
		expect(displayLayer).toHaveProperty("on");
		expect(displayLayer.on).toEqual({
			test: {
				action: [[{ name: ["SYSTEM", "test"], args: [] }]],
			},
			test2: {
				action: [[{ name: ["SYSTEM", "test2"], args: [2] }]],
			},
		});
	});

	it("should add handler with args", () => {
		const script = `
		display "intro" {
			display {
				on test $id {
					test($id)
				}
				on test2 $name $count {
					test2(2)
				}
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toHaveProperty("layers");

		const displayLayer = result.layers.find((layer) => layer.type === "display");
		expect(displayLayer).toBeDefined();
		expect(displayLayer).toHaveProperty("on");
		expect(displayLayer.on).toEqual({
			test: {
				action: [[{ name: ["SYSTEM", "test"], args: [new ArgVariable("id")] }]],
				args: ["id"],
			},
			test2: {
				action: [[{ name: ["SYSTEM", "test2"], args: [2] }]],
				args: ["name", "count"],
			},
		});
	});
});
