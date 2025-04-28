import { describe, expect, it } from "vitest";
import { OP_TYPES } from "../../../../../types/operation.types";
import { ArgColor } from "../../../../../types/value.types";
import { compileScript } from "../../../compiler";

describe("Repeat", () => {
	it("should do a repeat loop", () => {
		const script = `
		display "intro" {
			layout {
				rect at:20,30 width:150 height:220 color:red
				rect at:10,20 width:100 height:200
				rect at:10,20 width:100 height:200 fill:#445500
				color blue
				rect at:10,20 width:100 height:200 fill:white pad:2,2
			}
		}
		`;

		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("layout");
		expect(Array.isArray(result.layout)).toBe(true);

		const rect = result.layout.filter((op) => op.type === OP_TYPES.RECT);
		expect(Array.isArray(rect)).toBe(true);
		expect(rect.length).toBe(4);

		expect(rect[0]).toEqual({
			type: OP_TYPES.RECT,
			color: new ArgColor("red"),
			pos: [20, 30],
			width: 150,
			height: 220,
		});

		expect(rect[1]).toEqual({
			type: OP_TYPES.RECT,
			color: new ArgColor("white"),
			pos: [10, 20],
			width: 100,
			height: 200,
		});

		expect(rect[2]).toEqual({
			type: OP_TYPES.RECT,
			pos: [10, 20],
			width: 100,
			height: 200,
			fill: new ArgColor("#445500"),
		});

		expect(rect[3]).toEqual({
			type: OP_TYPES.RECT,
			pos: [10, 20],
			width: 100,
			height: 200,
			fill: new ArgColor("white"),
			pad: [2, 2],
		});
	});
});
