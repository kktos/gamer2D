import { describe, expect, it } from "vitest";
import { ArgColor } from "../../../types/value.types";
import { compileScript } from "../compiler";

describe("compileScript", () => {
	it("should compile a simple scene script", () => {
		const script = `
		display "intro" {
			showCursor
			background {
				color #FF0000
			}		
			game { }
			level {
				settings {
					one=1
				}
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toEqual({
			type: "display",
			name: "intro",
			showCursor: true,
			layers: [
				{
					type: "background",
					color: new ArgColor("#FF0000"),
				},
				{
					type: "game",
				},
				{
					type: "level",
					settings: {
						one: 1,
					},
				},
			],
		});
	});
});
