import { describe, expect, it } from "vitest";
import { compile } from "./compiler";
import type { TNeatLayer } from "./types/layers.type";

describe("compiler - layer background", () => {
	
	it("should compile a background layer with its options", () => {
		const scriptText = `
			layer background "bg"
			 with settings from "layers/background.json" 
			 with settings from "global/background.json"
			 with variables from "globals.json" {
				$level = 1
				color #000
				zoom 2
				image "sprites/sky.png" at 10,20 repeat 3,4
			}
		`;

		const result = compile<TNeatLayer>(scriptText, "layer");

		expect(result).toMatchObject({
			type: "background",
			name: "bg",
			load: [
				{
					type: "settings",
					path: "layers/background.json",
				},
				{
					type: "settings",
					path: "global/background.json",
				},
				{
					type: "variables",
					path: "globals.json",
				},
			],
			data: [
				{
					cmd: "ASSIGN",
					name: [{ type: "var", name: "level" }],
					value: [{ type: "const", value: 1 }],
				},
				{ cmd: "COLOR", color: "#000" },
				{ cmd: "ZOOM", value: [{ type: "const", value: 2 }] },
				{
					cmd: "IMAGE",
					source: [{ type: "const", value: "sprites/sky.png" }],
					at: { x: [{ type: "const", value: 10 }], y: [{ type: "const", value: 20 }] },
					repeat: [[{ type: "const", value: 3 }], [{ type: "const", value: 4 }]],
				},
			],
		});
	});
});
