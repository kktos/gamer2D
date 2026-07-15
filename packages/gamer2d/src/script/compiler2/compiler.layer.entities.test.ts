import { describe, expect, it } from "vitest";
import { compile } from "./compiler";
import type { TNeatLayer } from "./types/layers.type";

describe("compiler - layer entities", () => {
	it("should compile a minimal entities layer", () => {
		const scriptText = `
			layer entities "actors" {}
		`;

		const result = compile<TNeatLayer>(scriptText, "layer");

		expect(result).toMatchObject({
			type: "entities",
			name: "actors",
			load: [],
			data: [],
		});
	});

	it("should compile an entities layer with settings, for, timer, pool, and on commands", () => {
		const scriptText = `
			layer entities "actors"
				with settings from "layers/entities.json" {
					settings {
						maxHealth = 100
						debug = true
					}
					for $i 1,3 {
						sprite "gem" at $i,5
					}
					timer first every 2s
					
					pool "bullets" {
						sprite "bullet"
						capacity 10
					}
					on hit {
						$damage = 1
					}
				}
		`;

		const result = compile<TNeatLayer>(scriptText, "layer");

		expect(result).toMatchObject({
			type: "entities",
			name: "actors",
			load: [{ type: "settings", path: "layers/entities.json" }],
			data: [
				{
					cmd: "SETTINGS",
					value: {
						maxHealth: 100,
						debug: true,
					},
				},
				{
					cmd: "FOR",
					index: "i",
					list: [[{ type: "const", value: 1 }], [{ type: "const", value: 3 }]],
					body: [
						{
							cmd: "SPRITE",
							name: [{ type: "const", value: "gem" }],
							at: {
								x: [{ type: "var", name: "i" }],
								y: [{ type: "const", value: 5 }],
							},
						},
					],
				},
				{
					cmd: "TIMER",
					id: "first",
					duration: [{ type: "const", value: 2 }],
					timeScale: 1000,
					kind: "repeat",
				},
				{
					cmd: "POOL",
					spriteName: "bullet",
					capacity: [{ type: "const", value: 10 }],
					id: "bullets",
				},
				{
					cmd: "ON",
					event: "hit",
					params: [],
					statements: [
						{
							cmd: "ASSIGN",
							name: [{ type: "var", name: "damage" }],
							value: [{ type: "const", value: 1 }],
						},
					],
				},
			],
		});
	});

	it("should throw when a pool command is missing required arguments", () => {
		const scriptText = `
			layer entities "actors" {
				pool "bullet" at 5,5 count 10
			}
		`;

		expect(() => compile<TNeatLayer>(scriptText, "layer")).toThrow(
			"Missing required 'id' or 'count' argument in pool command.",
		);
	});
});
