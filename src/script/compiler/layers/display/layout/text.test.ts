import { describe, expect, it } from "vitest";
import { OP_TYPES } from "../../../../../types/operation.types";
import { ArgExpression, ArgVariable } from "../../../../../types/value.types";
import { compileScript } from "../../../compiler";

describe("Text", () => {
	it("should create a text with ID", () => {
		const script = `
		display "intro" {
			layout {
				text id:"test" "Hello World" at:110,428
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("layout");
		expect(Array.isArray(result.layout)).toBe(true);

		expect(result.layout).toEqual([
			{
				id: "test",
				pos: [110, 428],
				type: OP_TYPES.TEXT,
				text: "Hello World",
			},
		]);
	});

	it("should create a text with position using expressions", () => {
		const script = `
		display "intro" {
			layout {
				$posX=90
				text id:"test" "Hello World" at:$posX*2,428
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("layout");
		expect(Array.isArray(result.layout)).toBe(true);

		const text = result.layout.find((op) => op.type === OP_TYPES.TEXT);
		expect(text).toBeDefined();
		expect(text).toEqual({
			id: "test",
			pos: [new ArgExpression([new ArgVariable("posX"), 2, "Multiply"]), 428],
			type: OP_TYPES.TEXT,
			text: "Hello World",
		});
	});

	it.skip("should handle bad text definition", () => {
		const script = `
		display "intro" {
			layout {
				text id:"test" at:80,428
			}
		}
		`;
		expect(() => compileScript(script)).toThrowError(/sad sad panda/);
	});
});
