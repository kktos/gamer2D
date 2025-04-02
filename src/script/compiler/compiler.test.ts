import { describe, expect, it } from "vitest";
import { compileScript } from "./compiler";

describe("compileScript", () => {
	it("should compile a simple display script", () => {
		const script = `
		display "intro" {
			background #FF0000
			showCursor
			font "bubble-bobble"
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toStrictEqual({
			background: "#FF0000",
			font: "bubble-bobble",
			name: "intro",
			showCursor: true,
			type: "display",
		});
	});

	it.skip("should throw an error for invalid script", () => {
		const script = `
			type: invalidType
		`;
		expect(() => compileScript(script)).toThrow();
	});
});
