import { describe, expect, it } from "vitest";
import { OP_TYPES } from "../../../../../types/operation.types";
import { ArgExpression, ArgVariable } from "../../../../../types/value.types";
import { compileScript } from "../../../compiler";

describe("Repeat", () => {
	it("should do a repeat loop", () => {
		const script = `
		display "intro" {
			display {
				layout {
					$Ypos = 190
					repeat $idx count:9 {
						text $idx at:90,$Ypos+$idx*40
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
			count: 9,
			index: "idx",
			items: [
				{
					type: OP_TYPES.TEXT,
					text: new ArgVariable("idx"),
					pos: [90, new ArgExpression([new ArgVariable("Ypos"), new ArgVariable("idx"), 40, "Multiply", "Plus"])],
				},
			],
		});
	});
});
