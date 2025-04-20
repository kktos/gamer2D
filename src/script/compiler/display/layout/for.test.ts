import { describe, expect, it } from "vitest";
import { OP_TYPES } from "../../../../types/operation.types";
import { ArgVariable } from "../../../../types/value.types";
import { compileScript } from "../../compiler";

describe("For", () => {
	it("should do a for loop", () => {
		const script = `
		display "intro" {
			layout {

				$Ypos = 190
				for $idx 0,10 {
					text $positions.$idx at:90,$Ypos
					text $highscores.$idx.score at:250,$Ypos
					add $Ypos,40
				}

			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("layout");
		expect(Array.isArray(result.layout)).toBe(true);

		const menu = result.layout.find((op) => op.type === OP_TYPES.REPEAT);

		expect(menu).toEqual({
			type: OP_TYPES.REPEAT,
			from: 0,
			count: 11,
			var: "idx",
			items: [
				{
					type: OP_TYPES.TEXT,
					text: new ArgVariable("positions.$idx"),
					pos: [90, new ArgVariable("Ypos")],
				},
				{
					type: OP_TYPES.TEXT,
					text: new ArgVariable("highscores.$idx.score"),
					pos: [250, new ArgVariable("Ypos")],
				},
				{
					type: OP_TYPES.MATH,
					fn: "add",
					params: ["Ypos", 40],
				},
			],
		});
	});

	it("should do a for..of loop using varList", () => {
		const script = `
		display "intro" {
			layout {
				$menuItems = [
					"play",
					"intro"
				]
				$Ypos = 190
				for $menuItem of $menuItems {
					text $positions.$idx at:90,$Ypos
					add $Ypos,40
				}

			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("layout");
		expect(Array.isArray(result.layout)).toBe(true);

		const menu = result.layout.find((op) => op.type === OP_TYPES.REPEAT);

		expect(menu).toEqual({
			type: OP_TYPES.REPEAT,
			from: 0,
			count: 0,
			var: "menuItem",
			list: "menuItems",
			items: [
				{
					type: OP_TYPES.TEXT,
					text: new ArgVariable("positions.$idx"),
					pos: [90, new ArgVariable("Ypos")],
				},
				{
					type: OP_TYPES.MATH,
					fn: "add",
					params: ["Ypos", 40],
				},
			],
		});
	});

	it("should do a for..of loop using array", () => {
		const script = `
		display "intro" {
			layout {
				$Ypos = 190
				for $menuItem of ["play","intro"] {
					text $menuItem at:90,$Ypos
					add $Ypos,40
				}

			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("layout");
		expect(Array.isArray(result.layout)).toBe(true);

		const menu = result.layout.find((op) => op.type === OP_TYPES.REPEAT);

		expect(menu).toEqual({
			type: OP_TYPES.REPEAT,
			from: 0,
			count: 0,
			var: "menuItem",
			list: ["play", "intro"],
			items: [
				{
					type: OP_TYPES.TEXT,
					text: new ArgVariable("menuItem"),
					pos: [90, new ArgVariable("Ypos")],
				},
				{
					type: OP_TYPES.MATH,
					fn: "add",
					params: ["Ypos", 40],
				},
			],
		});
	});

	it("should raise an error when using unknown var in loop", () => {
		const script = `
		display "intro" {
			layout {
				for $idx 0,10 {
					text $positions.$idx at:90,$Ypos
					text $highscores.$idx.score at:250,$Ypos
					add $Ypos,40
				}
			}
		}
		`;
		expect(() => compileScript(script)).toThrowError(/Unknown variable "Ypos"/);
	});
});
