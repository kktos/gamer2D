import { describe, expect, it } from "vitest";
import { OP_TYPES } from "../../../types/operation.types";
import { compileScript } from "../compiler";

describe("Display", () => {
	it("should have settings", () => {
		const script = `
		display "intro" {

			background #000
			font "bubble-bobble"

			settings {
				$show_entities_count = true
				$show_entity_frame = false
			}

		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("settings");

		expect(result.settings).toEqual({
			show_entities_count: true,
			show_entity_frame: false,
		});
	});
});
