import { describe, expect, it } from "vitest";
import { OP_TYPES } from "../../../../types/operation.types";
import { ArgColor, ArgExpression, ArgVariable, ValueTrait } from "../../../../types/value.types";
import { compileScript } from "../../compiler";

describe("Set Var Value", () => {
	it("should set an array of strings", () => {
		const script = `
		display "intro" {
			layout {
				$menuItems = [
					"play",
					"intro"
				]
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("layout");
		expect(Array.isArray(result.layout)).toBe(true);

		const menuItems = result.layout.find((op) => op.name === "menuItems");
		expect(menuItems).toBeDefined();
		expect(menuItems).toHaveProperty("type", OP_TYPES.SET);
		expect(menuItems).toHaveProperty("value", ["play", "intro"]);
	});

	it("should set an array of colors", () => {
		const script = `
		display "intro" {
			layout {
				$colors = [
					#11223344,
					#FF00FF
				]
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("layout");
		expect(Array.isArray(result.layout)).toBe(true);

		const colors = result.layout.find((op) => op.name === "colors");
		expect(colors).toBeDefined();
		expect(colors).toHaveProperty("type", OP_TYPES.SET);
		expect(colors).toHaveProperty("value", [new ArgColor("#11223344"), new ArgColor("#FF00FF")]);
	});

	it("should set an array of numbers", () => {
		const script = `
		display "intro" {
			layout {
				$numbers = [
					350,
					600
				]
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("layout");
		expect(Array.isArray(result.layout)).toBe(true);

		const numbers = result.layout.find((op) => op.name === "numbers");
		expect(numbers).toBeDefined();
		expect(numbers).toHaveProperty("type", OP_TYPES.SET);
		expect(numbers).toHaveProperty("value", [350, 600]);
	});

	it("should set an array of variables", () => {
		const script = `
		display "intro" {
			layout {
				$traits = [
					$one,
					$two
				]
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("layout");
		expect(Array.isArray(result.layout)).toBe(true);

		const numbers = result.layout.find((op) => op.name === "traits");
		expect(numbers).toBeDefined();
		expect(numbers).toHaveProperty("type", OP_TYPES.SET);
		expect(numbers).toHaveProperty("value", [new ArgVariable("one"), new ArgVariable("two")]);
	});

	it("should set traits", () => {
		const script = `
		display "intro" {
			layout {
				$fadein = trait FadeTrait("in", #00000000)
				$mousX =  trait MouseXTrait()
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("layout");
		expect(Array.isArray(result.layout)).toBe(true);

		const fadein = result.layout.find((op) => op.name === "fadein");
		expect(fadein).toBeDefined();
		expect(fadein).toHaveProperty("type", OP_TYPES.SET);
		expect(fadein).toHaveProperty("value", new ValueTrait("FadeTrait", ["in", new ArgColor("#00000000")]));

		const mousX = result.layout.find((op) => op.name === "mousX");
		expect(mousX).toBeDefined();
		expect(mousX).toHaveProperty("type", OP_TYPES.SET);
		expect(mousX).toHaveProperty("value", new ValueTrait("MouseXTrait", []));
	});


	it("should set expr", () => {
		const script = `
		display "intro" {
			layout {
				$x=0
				$y=0
				$z=0
				$rez = $x+($z+(45*$y))*2
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("layout");
		expect(Array.isArray(result.layout)).toBe(true);

		const fadein = result.layout.find((op) => op.name === "rez");
		expect(fadein).toBeDefined();
		expect(fadein).toHaveProperty("type", OP_TYPES.SET);
		expect(fadein).toHaveProperty(
			"value",
			new ArgExpression([new ArgVariable("x"), new ArgVariable("z"), 45, new ArgVariable("y"), "Multiply", "Plus", 2, "Multiply", "Plus"]),
		);
	});
});
