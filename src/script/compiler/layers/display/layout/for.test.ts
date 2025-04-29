import { describe, expect, it } from "vitest";
import { OP_TYPES } from "../../../../../types/operation.types";
import { ArgExpression, ArgVariable } from "../../../../../types/value.types";
import { compileScript } from "../../../compiler";

describe("For", () => {
	it("should do a for loop", () => {
		const script = `
		display "intro" {
			display {
			layout {

				$Ypos = 190
				for $idx 0,10 {
					text $positions.$idx at:90,$Ypos+$idx*40
					text $highscores.$idx.score at:250,$Ypos+$idx*40
				}

			}
			}
		}
		`;
		const vars = new Map<string, unknown>();
		vars.set("positions", 0);
		vars.set("highscores", 0);

		const result = compileScript(script, vars);
		expect(result).toBeDefined();
		const displayLayer = result.layers.find((layer) => layer.type === "display");
		expect(displayLayer).toBeDefined();
		expect(displayLayer).toHaveProperty("layout");
		expect(Array.isArray(displayLayer.layout)).toBe(true);

		const menu = displayLayer.layout.find((op) => op.type === OP_TYPES.REPEAT);

		expect(menu).toEqual({
			type: OP_TYPES.REPEAT,
			from: 0,
			count: 10,
			index: "idx",
			items: [
				{
					type: OP_TYPES.TEXT,
					text: new ArgVariable("positions.$idx"),
					pos: [90, new ArgExpression([new ArgVariable("Ypos"), new ArgVariable("idx"), 40, "Multiply", "Plus"])],
				},
				{
					type: OP_TYPES.TEXT,
					text: new ArgVariable("highscores.$idx.score"),
					pos: [250, new ArgExpression([new ArgVariable("Ypos"), new ArgVariable("idx"), 40, "Multiply", "Plus"])],
				},
			],
		});
	});

	it("should do a for..of loop using varList", () => {
		const script = `
		display "intro" {
			display {
			layout {
				$menuItems = [
					"play",
					"intro"
				]
				$Ypos = 190
				for $menuItem of $menuItems index:$idx{
					text $menuItem at:90,$Ypos+$idx*40
				}

			}
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		const displayLayer = result.layers.find((layer) => layer.type === "display");
		expect(displayLayer).toBeDefined();
		expect(displayLayer).toHaveProperty("layout");
		expect(Array.isArray(displayLayer.layout)).toBe(true);

		const menu = displayLayer.layout.find((op) => op.type === OP_TYPES.REPEAT);

		expect(menu).toEqual({
			type: OP_TYPES.REPEAT,
			from: 0,
			count: 0,
			var: "menuItem",
			list: "menuItems",
			index: "idx",
			items: [
				{
					type: OP_TYPES.TEXT,
					text: new ArgVariable("menuItem"),
					pos: [90, new ArgExpression([new ArgVariable("Ypos"), new ArgVariable("idx"), 40, "Multiply", "Plus"])],
				},
			],
		});
	});

	it("should do a for..of loop using array", () => {
		const script = `
		display "intro" {
			display {
			layout {
				$Ypos = 190
				for $menuItem of ["play","intro"] index:$idx {
					text $menuItem at:90,$Ypos+$idx*40
				}

			}
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		const displayLayer = result.layers.find((layer) => layer.type === "display");
		expect(displayLayer).toBeDefined();
		expect(displayLayer).toHaveProperty("layout");
		expect(Array.isArray(displayLayer.layout)).toBe(true);

		const menu = displayLayer.layout.find((op) => op.type === OP_TYPES.REPEAT);

		expect(menu).toEqual({
			type: OP_TYPES.REPEAT,
			from: 0,
			count: 0,
			var: "menuItem",
			list: ["play", "intro"],
			index: "idx",
			items: [
				{
					type: OP_TYPES.TEXT,
					text: new ArgVariable("menuItem"),
					pos: [90, new ArgExpression([new ArgVariable("Ypos"), new ArgVariable("idx"), 40, "Multiply", "Plus"])],
				},
			],
		});
	});

	it("should do a for..of loop with iterator var", () => {
		const script = `
		display "intro" {
			display {
			layout {
				$Ypos = 190
				for $menuItem of ["play","intro"] index:$idx {
					text $menuItem at:90,$Ypos+$idx*40
				}

			}
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		const displayLayer = result.layers.find((layer) => layer.type === "display");
		expect(displayLayer).toBeDefined();
		expect(displayLayer).toHaveProperty("layout");
		expect(Array.isArray(displayLayer.layout)).toBe(true);

		const menu = displayLayer.layout.find((op) => op.type === OP_TYPES.REPEAT);

		expect(menu).toEqual({
			type: OP_TYPES.REPEAT,
			from: 0,
			count: 0,
			var: "menuItem",
			list: ["play", "intro"],
			index: "idx",
			items: [
				{
					type: OP_TYPES.TEXT,
					text: new ArgVariable("menuItem"),
					pos: [90, new ArgExpression([new ArgVariable("Ypos"), new ArgVariable("idx"), 40, "Multiply", "Plus"])],
				},
			],
		});
	});

	it("should raise an error when using unknown var in loop", () => {
		const script = `
		display "intro" {
			display {
			layout {
				for $idx 0,10 {
					text $idx at:90,$Ypos
				}
			}
			}
		}
		`;
		expect(() => compileScript(script)).toThrowError(/Unknown variable "Ypos"/);
	});
});
