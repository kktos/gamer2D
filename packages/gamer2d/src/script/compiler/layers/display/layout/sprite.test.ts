import { describe, expect, it } from "vitest";
import { OP_TYPES } from "../../../../../types/operation.types";
import { compile, compileScript } from "../../../compiler";

describe("Sprite", () => {
	it("should create a sprite", () => {
		const script = `
		display "intro" {
			display {
				layout {
					sprite "BubblunEntity" at:90,428
					sprite "BubblunEntity" at:90,428 dir:right
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

		expect(displayLayer.layout).toEqual([
			{
				pos: [90, 428],
				type: OP_TYPES.SPRITE,
				name: "BubblunEntity",
			},
			{
				pos: [90, 428],
				type: OP_TYPES.SPRITE,
				name: "BubblunEntity",
				dir: 1,
			},
		]);
	});

	it("should create a sprite with ID", () => {
		const script = `
		display "intro" {
			display {
				layout {
					sprite "BubblunEntity" id:"test" at:90,428
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

		expect(displayLayer.layout).toEqual([
			{
				id: "test",
				pos: [90, 428],
				type: OP_TYPES.SPRITE,
				name: "BubblunEntity",
			},
		]);
	});

	it("should create a sprite with with and height", () => {
		const script = `
			sprite "*" id:"test" width:10 height:20 at:90,428
		`;
		const result = compile(script, "layoutSprite");
		expect(result).toEqual({
			id: "test",
			pos: [90, 428],
			type: OP_TYPES.SPRITE,
			name: "*",
			width: 10,
			height: 20,
		});
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

	it("should handle bad sprite definition - unknown var", () => {
		const script = `
		display "intro" {
			display {
				layout {
					sprite "bubblun:life" at:20+($idx-1)*12,460
				}
			}
		}
		`;
		expect(() => compileScript(script)).toThrowError(/Unknown variable "idx"/);
	});

	it("should handle bad sprite definition - no at:", () => {
		const script = `
		display "intro" {
			display {
				layout {
					sprite "bubblun:life" id:"3"
				}
			}
		}
		`;
		expect(() => compileScript(script)).toThrowError(/Missing required prop 'at:'/);
	});
});
