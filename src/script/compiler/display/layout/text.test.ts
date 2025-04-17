import { describe, expect, it } from "vitest";
import { OP_TYPES } from "../../../../types/operation.types";
import { compileScript } from "../../compiler";

describe("Text", () => {
	it("should create a text with ID", () => {
		const script = `
		display "intro" {
			layout {
				text id:"test" "Hello World" at:90,428
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
				pos: [90, 428],
				type: OP_TYPES.TEXT,
				text: "Hello World",
			},
		]);
	});

	it.skip("should handle bad sprite definition", () => {
		const script = `
		display "intro" {
			layout {
				sprite id:"test" at:90,428
			}
		}
		`;
		expect(() => compileScript(script)).toThrowError(/sad sad panda/);
	});
});
