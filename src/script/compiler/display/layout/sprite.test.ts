import { describe, expect, it } from "vitest";
import { OP_TYPES } from "../../../../types/operation.types";
import { compileScript } from "../../compiler";

describe("Sprite", () => {
	it("should create a sprite", () => {
		const script = `
		display "intro" {
			layout {
				sprite "BubblunEntity" at:90,428
				sprite "BubblunEntity" at:90,428 dir:right
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("layout");
		expect(Array.isArray(result.layout)).toBe(true);

		expect(result.layout).toEqual([
			{
				pos: [90, 428],
				type: OP_TYPES.SPRITE,
				sprite: "BubblunEntity",
				zoom: 1,
			},
			{
				pos: [90, 428],
				type: OP_TYPES.SPRITE,
				sprite: "BubblunEntity",
				zoom: 1,
				dir: 1,
			},
		]);
	});

	it("should create a sprite with ID", () => {
		const script = `
		display "intro" {
			layout {
				sprite id:"test" "BubblunEntity" at:90,428
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
				type: OP_TYPES.SPRITE,
				sprite: "BubblunEntity",
				zoom: 1,
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
