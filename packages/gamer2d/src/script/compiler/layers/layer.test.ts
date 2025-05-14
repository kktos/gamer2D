import { describe, expect, it } from "vitest";
import { compileLayerScript, compileScript } from "../compiler";

describe("Layer", () => {
	it("should compile a simple layer script", () => {
		const script = `
			layer level {
				settings {
					one=1
				}
			}
		`;
		const result = compileLayerScript(script);
		expect(result).toBeDefined();
		expect(result).toEqual({
			type: "level",
			settings: {
				one: 1,
			},
		});
	});

	it("should compile a simple layer script", () => {
		const script = `
			display "intro" {
				game {}
				layer "scriptToInclude"
			}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toEqual({
			type: "display",
			name: "intro",
			layers: [
				{
					type: "game",
				},
				{
					type: "*",
					name: "scriptToInclude",
				},
			],
		});
	});
});
