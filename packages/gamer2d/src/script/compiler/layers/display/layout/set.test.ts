import { beforeAll, describe, expect, it } from "vitest";
import { OP_TYPES } from "../../../../../types/operation.types";
import { ArgColor, ArgExpression, ArgVariable, ValueTrait } from "../../../../../types/value.types";
import { compile, compileScript, setWannaLogError } from "../../../compiler";
import type { TLayerDisplaySheet } from "../display.rules";

describe("Set Var Value", () => {
	beforeAll(() => {
		setWannaLogError(true);
	});

	it("should set an array of strings", () => {
		const script = `
		display "intro" {
			display {
			layout {
				$menuItems = [
					"play",
					"intro"
				]
			}
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		const displayLayer = result.layers.find((layer) => layer.type === "display") as TLayerDisplaySheet;
		expect(displayLayer).toHaveProperty("layout");
		expect(Array.isArray(displayLayer.layout)).toBe(true);

		const menuItems = displayLayer.layout?.find((op) => "name" in op && op.name === "menuItems");
		expect(menuItems).toHaveProperty("type", OP_TYPES.SET);
		expect(menuItems).toHaveProperty("value", ["play", "intro"]);
	});

	it("should set an array of colors", () => {
		const script = `
		display "intro" {
			display {
			layout {
				$colors = [
					#11223344,
					#FF00FF
				]
			}
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		const displayLayer = result.layers.find((layer) => layer.type === "display") as TLayerDisplaySheet;
		expect(displayLayer).toHaveProperty("layout");
		expect(Array.isArray(displayLayer.layout)).toBe(true);

		const colors = displayLayer.layout?.find((op) => "name" in op && op.name === "colors");
		expect(colors).toHaveProperty("type", OP_TYPES.SET);
		expect(colors).toHaveProperty("value", [new ArgColor("#11223344"), new ArgColor("#FF00FF")]);
	});

	it("should set an array of numbers", () => {
		const script = `
		display "intro" {
			display {
			layout {
				$numbers = [
					350,
					600
				]
			}
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		const displayLayer = result.layers.find((layer) => layer.type === "display") as TLayerDisplaySheet;
		expect(displayLayer).toHaveProperty("layout");
		expect(Array.isArray(displayLayer.layout)).toBe(true);

		const numbers = displayLayer.layout?.find((op) => "name" in op && op.name === "numbers");
		expect(numbers).toHaveProperty("type", OP_TYPES.SET);
		expect(numbers).toHaveProperty("value", [350, 600]);
	});

	it("should set an array of variables", () => {
		const script = `
				$traits = [
					$one,
					$two
				]
		`;
		const result = compile(script, "layoutSet");
		expect(result).toBeDefined();
		expect(result).toHaveProperty("type", OP_TYPES.SET);
		expect(result).toHaveProperty("value", [new ArgVariable("one"), new ArgVariable("two")]);
	});

	describe("Set Traits", () => {
		it("should deal with traits as var value", () => {
			const script = `
				trait FadeTrait("in", #00000000)
		`;
			const result = compile(script, "layoutSetValue");
			expect(result).toEqual(new ValueTrait("FadeTrait", ["in", new ArgColor("#00000000")]));
		});

		it("should deal with traits with expression", () => {
			const globals = new Map<string, unknown>([["ypos", 0]]);
			const script = "trait XDragTrait(600+($ypos*-1),70)";
			const result = compile(script, "layoutSetValue", globals);
			expect(result).toEqual(new ValueTrait("XDragTrait", [new ArgExpression([600, new ArgVariable("ypos"), -1, "Multiply", "Plus"]), 70]));
		});
	});

	it("should set expr", () => {
		const script = `
		display "intro" {
			display {
			layout {
				$x=0
				$y=0
				$z=0
				$rez = $x+($z+(45*$y))*2
			}
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		const displayLayer = result.layers.find((layer) => layer.type === "display") as TLayerDisplaySheet;
		expect(displayLayer).toBeDefined();
		expect(displayLayer).toHaveProperty("layout");
		expect(Array.isArray(displayLayer.layout)).toBe(true);

		const fadein = displayLayer.layout?.find((op) => "name" in op && op.name === "rez");
		expect(fadein).toBeDefined();
		expect(fadein).toHaveProperty("type", OP_TYPES.SET);
		expect(fadein).toHaveProperty(
			"value",
			new ArgExpression([new ArgVariable("x"), new ArgVariable("z"), 45, new ArgVariable("y"), "Multiply", "Plus", 2, "Multiply", "Plus"]),
		);
	});
});
