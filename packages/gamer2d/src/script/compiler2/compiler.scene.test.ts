import { describe, expect, it } from "vitest";
import { compile } from "./compiler";
import type { TNeatScene } from "./types/scenes.type";

describe("compiler - scene", () => {
	it("should compile a display scene", () => {
		const scriptText = `
			display "test_scene" {
				showcursor false
				debug true
				layer ui "ui" {}
			}
		`;

		const result = compile<TNeatScene>(scriptText, "scene");

		expect(result).toMatchObject({
			type: "display",
			name: "test_scene",
			showCursor: false,
			debug: true,
			layers: [
				{
					type: "ui",
					name: "ui",
				},
			],
		});
	});

	it("should reject a scene without any layers", () => {
		const scriptText = `
			display "test_scene" {
				showcursor false
				debug true
			}
		`;

		expect(() => compile<TNeatScene>(scriptText, "scene")).toThrow(/at least one layer/i);
	});
});
