import { describe, expect, it } from "vitest";
import { ArgVariable } from "../../../types/value.types";
import { compileScript } from "../compiler";

describe("Variables", () => {
	it("should set  a variable from a global variable", () => {
		const script = `
		display "intro" {
			display {
				layout {
					$fadein = $highScore
				}
			}
		}
		`;

		const vars = new Map();
		vars.set("highScore", 0);

		const result = compileScript(script, vars);
		expect(result).toBeDefined();

		const displayLayer = result.layers.find((layer) => layer.type === "display");
		expect(displayLayer).toHaveProperty("layout");
		expect(Array.isArray(displayLayer.layout)).toBe(true);

		const fadein = displayLayer.layout.find((op) => op.name === "fadein");
		expect(fadein).toHaveProperty("value", new ArgVariable("highScore"));
	});
});
