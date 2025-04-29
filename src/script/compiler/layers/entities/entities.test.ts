import { describe, expect, it } from "vitest";
import { compileScript } from "../../compiler";

describe("Entities Layers", () => {
	it("should deal with empty entities layer", () => {
		const script = `
		display "intro" {
			level {
				settings {
					one=1
				}
			}
			worldcollision { }
			entities { }
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
					type: "worldcollision",
				},
				{
					type: "entities",
				},
			],
		});
	});

	it("should deal with entities layer with settings", () => {
		const script = `
		display "intro" {
			level {
				settings {
					one=1
				}
			}
			worldcollision { }
			entities {
				settings {show_entities_count = true}
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
					type: "worldcollision",
				},
				{
					type: "entities",
					settings: {
						show_entities_count: true,
					},
				},
			],
		});
	});

	it("should deal with entities layer with sprites", () => {
		const script = `
		display "intro" {
			worldcollision { }
			entities {
				sprite "zen-chan" at:16,5 dir:left
				sprite "bubblun" at:16,11 dir:left
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
					type: "worldcollision",
				},
				{
					type: "entities",
					sprites: [
						{
							name: "zen-chan",
							pos: [16, 5],
							dir: 0,
						},
						{
							name: "bubblun",
							pos: [16, 11],
							dir: 0,
						},
					],
				},
			],
		});
	});
});
