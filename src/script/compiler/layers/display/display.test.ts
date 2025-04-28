import { describe, expect, it } from "vitest";
import { compileScript } from "../../compiler";

describe("Display", () => {
	it("should have settings", () => {
		const script = `
		display "intro" {
			display {
				font "bubble-bobble"
				settings {
					show_entities_count = true
					show_entity_frame = false
				}
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("layers");

		const displayLayer = result.layers.find((layer) => layer.type === "display");
		expect(displayLayer).toBeDefined();

		expect(displayLayer).toHaveProperty("settings");

		expect(displayLayer.settings).toEqual({
			show_entities_count: true,
			show_entity_frame: false,
		});
	});
});
