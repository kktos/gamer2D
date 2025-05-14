import { describe, expect, it } from "vitest";
import { ArgColor } from "../../../../types/value.types";
import { compileScript } from "../../compiler";

describe("User Defined Layers", () => {
	it("should deal with empty user layer", () => {
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
			worldcollision { }
			myLayer { }
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
				{
					type: "worldcollision",
				},
				{
					type: "myLayer",
				},
			],
		});
	});

	it("should deal with user layer with settings", () => {
		const script = `
		display "intro" {
			level {
				settings {
					one=1
				}
			}
			myLayer {
				var1 = 65
				var2 = "test"
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toEqual({
			type: "display",
			name: "intro",
			layers: [
				{
					type: "level",
					settings: {
						one: 1,
					},
				},
				{
					type: "myLayer",
					settings: {
						var1: 65,
						var2: "test",
					},
				},
			],
		});
	});
});
