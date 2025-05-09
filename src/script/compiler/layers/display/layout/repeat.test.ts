import { describe, expect, it } from "vitest";
import { OP_TYPES } from "../../../../../types/operation.types";
import { ArgExpression, ArgVariable } from "../../../../../types/value.types";
import { compile } from "../../../compiler";

describe("Repeat", () => {
	it("should do a repeat loop", () => {
		const script = `
			repeat $idx count:9 {
				text $idx at:90,$Ypos+$idx*40
			}
		`;

		const globals = new Map<string, unknown>([["Ypos", 0]]);
		const result = compile(script, "layoutRepeat", globals);
		expect(result).toBeDefined();
		expect(result).toEqual({
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
