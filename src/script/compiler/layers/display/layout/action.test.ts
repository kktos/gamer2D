import { describe, expect, it } from "vitest";
import { OP_TYPES } from "../../../../../types/operation.types";
import { compileScript } from "../../../compiler";

describe("Action", () => {
	it("should define a simple action", () => {
		const script = `
		display "intro" {
			display {
				on "FAKE" {
					$myVar = 3
					call(1,2,3)
				}
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();

		const displayLayer = result.layers.find((layer) => layer.type === "display");
		expect(displayLayer).toBeDefined();
		expect(displayLayer.on).toEqual({
			FAKE: {
				action: [{ name: "myVar", type: OP_TYPES.SET, value: 3 }, [{ name: ["SYSTEM", "call"], args: [1, 2, 3] }]],
			},
		});
	});
});
