import { describe, expect, it } from "vitest";
import { compile } from "./compiler";
import type { TNeatLayer } from "./types/layers.type";

describe("compiler - layer globals", () => {
	it("should compile a minimal globals layer", () => {
		const scriptText = `
			layer globals "globals" {}
		`;

		const result = compile<TNeatLayer>(scriptText, "layer");

		expect(result).toMatchObject({
			type: "globals",
			name: "globals",
			load: [],
			data: [],
		});
	});

	it("should compile a globals layer with all supported variable assignment syntax", () => {
		const scriptText = `
			layer globals "globals" {
				$level = 1
				$player.name = "hero"
				$isActive = true
				$score = $level + 10
			}
		`;

		const result = compile<TNeatLayer>(scriptText, "layer");

		expect(result).toMatchObject({
			type: "globals",
			name: "globals",
			load: [],
			data: [
				{
					cmd: "ASSIGN",
					name: [{ type: "var", name: "level" }],
					value: [{ type: "const", value: 1 }],
				},
				{
					cmd: "ASSIGN",
					name: [
						{ type: "var", name: "player" },
						{ type: "const", value: "name" },
					],
					value: [{ type: "const", value: "hero" }],
				},
				{
					cmd: "ASSIGN",
					name: [{ type: "var", name: "isActive" }],
					value: [{ type: "const", value: "true" }],
				},
				{
					cmd: "ASSIGN",
					name: [{ type: "var", name: "score" }],
					value: [
						{ type: "var", name: "level" },
						{ type: "const", value: 10 },
						{ type: "op", op: "+" },
					],
				},
			],
		});
	});

	it("should throw when globals layer contains invalid assignment syntax", () => {
		const scriptText = `
			layer globals "globals" {
				$level =
			}
		`;

		expect(() => compile<TNeatLayer>(scriptText, "layer")).toThrow(/Invalid token|Unexpected token/i);
	});
});
