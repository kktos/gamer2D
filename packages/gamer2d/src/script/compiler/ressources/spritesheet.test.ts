import { describe, expect, it } from "vitest";
import { compile } from "../compiler";
import type { TSpriteSheet } from "./spritesheet.rules";

describe("SpriteSheet Rules", () => {
	describe("SpriteSheet", () => {
		it("should compile a minimal spritesheet script", () => {
			const script = `
			spritesheet "misc" {
				image "images/misc.png"
				sprites {
					grid 16,16
					"test" { rect [0,0,16,16] }
				}
			}
		`;
			const result = compile<TSpriteSheet>(script, "spriteSheet");
			expect(result).toBeDefined();
			expect(result).toEqual({
				name: "misc",
				image: "images/misc.png",
				sprites: [
					{
						size: [16, 16],
						inc: [1, 0],
						gap: [0, 0],
					},
					{
						name: "test",
						def: [[0, 0, 16, 16]],
					},
				],
			});
		});

		it("should break as no spritesheet name is provided", () => {
			const script = `spritesheet "" {}`;
			expect(() => compile(script, "spriteSheet")).toThrowError(/Missing SpriteSheet name./);
		});

		it("should break as no image name is provided", () => {
			const script = `
			spritesheet "test" {
				image ""
			}
		`;
			expect(() => compile(script, "spriteSheet")).toThrowError(/Missing Image name./);
		});

		it("should break as no sprites are provided", () => {
			const script = `
			spritesheet "test" {
				image "images/misc.png"
			}
		`;
			expect(() => compile(script, "spriteSheet")).toThrowError(
				expect.objectContaining({
					line: 4,
					word: "}",
				}),
			);
		});
	});

	describe("Sprites", () => {
		it("should break as no grid is provided", () => {
			const script = `
			spritesheet "test" {
				image "images/misc.png"
				sprites {
					"test" { rect [0,0,16,16] }
				}
			}
		`;
			expect(() => compile(script, "spriteSheet")).toThrowError(/At least one grid is required./);
		});

		it("should break as no sprite def is provided", () => {
			const script = `
			spritesheet "test" {
				image "images/misc.png"
				sprites {
					grid 16,16
				}
			}
		`;
			expect(() => compile(script, "spriteSheet")).toThrowError(/At least one sprite is required./);
		});

		it("should break sprite has no name", () => {
			const script = `
			spritesheet "test" {
				image "images/misc.png"
				sprites {
					grid 16,16
					"" { rect [0,0,16,16] }
				}
			}
		`;
			expect(() => compile(script, "spriteSheet")).toThrowError(/Missing Sprite name./);
		});
	});

	describe("Animations", () => {
		it("should compile a animation", () => {
			const script = `
			spritesheet "misc" {
				image "images/misc.png"
				sprites {
					grid 16,16
					"test" { rect [0,0,16,16] }
				}
				animations {
					"test" { frames "test" range:0,1 }
				}
			}
		`;
			const result = compile<TSpriteSheet>(script, "spriteSheet");
			expect(result).toBeDefined();
			expect(result).toEqual({
				name: "misc",
				image: "images/misc.png",
				sprites: [
					{
						size: [16, 16],
						inc: [1, 0],
						gap: [0, 0],
					},
					{
						name: "test",
						def: [[0, 0, 16, 16]],
					},
				],
				animations: { test: { frames: { range: [0, 1], sprite: "test" } } },
			});
		});

		it("should compile an animation with length and loop", () => {
			const script = `
			spritesheet "misc" {
				image "images/misc.png"
				sprites {
					grid 16,16
					"test" { rect [0,0,16,16] }
				}
				animations {
					"test" {
						loop 1
						length 2
						frames from "test" range:0,1
					}
				}
			}
		`;
			const result = compile<TSpriteSheet>(script, "spriteSheet");
			expect(result).toBeDefined();
			expect(result).toEqual({
				name: "misc",
				image: "images/misc.png",
				sprites: [
					{
						size: [16, 16],
						inc: [1, 0],
						gap: [0, 0],
					},
					{
						name: "test",
						def: [[0, 0, 16, 16]],
					},
				],
				animations: {
					test: {
						frames: { range: [0, 1], sprite: "test" },
						length: 2,
						loop: 1,
					},
				},
			});
		});

		it("should compile an animation with list of sprites", () => {
			const script = `
			spritesheet "misc" {
				image "images/misc.png"
				sprites {
					grid 16,16
					"test" { rect [0,0,16,16] }
				}
				animations {
					"test" {
						loop 1
						length 2
						frames ["test"]
					}
				}
			}
		`;
			const result = compile<TSpriteSheet>(script, "spriteSheet");
			expect(result).toBeDefined();
			expect(result).toEqual({
				name: "misc",
				image: "images/misc.png",
				sprites: [
					{
						size: [16, 16],
						inc: [1, 0],
						gap: [0, 0],
					},
					{
						name: "test",
						def: [[0, 0, 16, 16]],
					},
				],
				animations: {
					test: {
						frames: ["test"],
						length: 2,
						loop: 1,
					},
				},
			});
		});

		it("should break is animation has no name", () => {
			const script = `
				spritesheet "misc" {
					image "images/misc.png"
					sprites {
						grid 16,16
						"test" { rect [0,0,16,16] }
					}
					animations {
						"" { frames "test" range:0,1 }
					}
				}
			`;
			expect(() => compile(script, "spriteSheet")).toThrowError(/Missing Animation name./);
		});
	});
});
