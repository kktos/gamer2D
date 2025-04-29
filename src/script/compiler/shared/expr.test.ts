import { describe, expect, it } from "vitest";
import { compileScript } from "../compiler";

describe("Expr", () => {
	it("should do addition", () => {
		const script = `
		display "intro" { display { layout { $fadein = 6+6 } } }
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();

		const displayLayer = result.layers.find((layer) => layer.type === "display");
		expect(displayLayer).toHaveProperty("layout");
		expect(Array.isArray(displayLayer.layout)).toBe(true);

		const fadein = displayLayer.layout.find((op) => op.name === "fadein");
		expect(fadein).toHaveProperty("value", 12);
	});

	it("should do substraction", () => {
		const script = `
		display "intro" { display { layout { $fadein = 12-2-2 } } }
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();

		const displayLayer = result.layers.find((layer) => layer.type === "display");
		expect(displayLayer).toHaveProperty("layout");
		expect(Array.isArray(displayLayer.layout)).toBe(true);

		const fadein = displayLayer.layout.find((op) => op.name === "fadein");
		expect(fadein).toHaveProperty("value", 8);
	});

	it("should do multiplication", () => {
		const script = `
		display "intro" { display { layout { $fadein = 8*4*2 } } }
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();

		const displayLayer = result.layers.find((layer) => layer.type === "display");
		expect(displayLayer).toHaveProperty("layout");
		expect(Array.isArray(displayLayer.layout)).toBe(true);

		const fadein = displayLayer.layout.find((op) => op.name === "fadein");
		expect(fadein).toHaveProperty("value", 64);
	});

	it("should do division", () => {
		const script = `
		display "intro" { display { layout {
			$fadein = 64/2/2
		} } }
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();

		const displayLayer = result.layers.find((layer) => layer.type === "display");
		expect(displayLayer).toHaveProperty("layout");
		expect(Array.isArray(displayLayer.layout)).toBe(true);

		const fadein = displayLayer.layout.find((op) => op.name === "fadein");
		expect(fadein).toHaveProperty("value", 16);
	});

	it("should do respect priorities", () => {
		const script = `
		display "intro" { display { layout {
			$fadein = 4-2+4/2*2
		} } }
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();

		const displayLayer = result.layers.find((layer) => layer.type === "display");
		expect(displayLayer).toHaveProperty("layout");
		expect(Array.isArray(displayLayer.layout)).toBe(true);

		const fadein = displayLayer.layout.find((op) => op.name === "fadein");
		expect(fadein).toHaveProperty("value", 6);
	});

	it("should do deal with sub expr ()", () => {
		const script = `
		display "intro" { display { layout {
			$fadein = (4-2)+4/(2*2)
		} } }
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();

		const displayLayer = result.layers.find((layer) => layer.type === "display");
		expect(displayLayer).toHaveProperty("layout");
		expect(Array.isArray(displayLayer.layout)).toBe(true);

		const fadein = displayLayer.layout.find((op) => op.name === "fadein");
		expect(fadein).toHaveProperty("value", 3);
	});
});
