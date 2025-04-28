import { describe, expect, it } from "vitest";
import { compileScript } from "./compiler";

describe("compileScript", () => {
	it("should compile a simple display script", () => {
		const script = `
		display "intro" {
			showCursor
			game {}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toStrictEqual({
			name: "intro",
			showCursor: true,
			type: "display",
			layers: [{ type: "game" }],
		});
	});

	it.skip("should throw an error for invalid script", () => {
		const script = `
			type: invalidType
		`;
		expect(() => compileScript(script)).toThrow();
	});
});
