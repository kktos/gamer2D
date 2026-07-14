import { describe, expect, it } from "vitest";
import { compile } from "./compiler";
import type { TSpriteSheet } from "./rules/ressources/spritesheet.rule";

describe("compiler", () => {
	it("should compile a spritesheet", () => {
		const script = `
			spritesheet "player" {
				image "assets/player.png"
				sprites {
					"idle" {
						rect [0, 0, 32, 32]
					}
					"walk" {
						tiles at 0, 32 count 4
					}
				}
				animations {
					"walk_anim" {
						frames "walk" range 0, 3
						length 0.5
						loop 1
					}
				}
			}
		`;

		const result = compile<TSpriteSheet>(script, "spritesheet");
		
		expect(result).toMatchObject({
			name: "player",
			image: "assets/player.png",
			sprites: [
				{
					name: "idle",
					def: [[0, 0, 32, 32]]
				},
				{
					name: "walk",
					def: [{ at: { x: 0, y: 32 }, count: 4 }]
				}
			],
			animations: {
				"walk_anim": {
					frames: { sprite: "walk", range: [0, 3] },
					length: 0.5,
					loop: 1
				}
			}
		});
	});

	it("should throw an error for a spritesheet without sprites", () => {
		const script = `
			spritesheet "min" {
				image "assets/min.png"
			}
		`;

		expect(() => compile<TSpriteSheet>(script, "spritesheet")).toThrow("Missing sprites for spritesheet min");
	});

	it("should throw an error for a spritesheet without an image", () => {
		const script = `
			spritesheet "no_image" {
				sprites {
					"idle" {
						rect [0, 0, 32, 32]
					}
				}
			}
		`;

		expect(() => compile<TSpriteSheet>(script, "spritesheet")).toThrow("Missing image property for spritesheet no_image");
	});

	it("should parse different ways to define animations", () => {
		const script = `
			spritesheet "anim_types" {
				image "assets/anim.png"
				sprites {
					"dummy" { rect [0,0,10,10] }
				}
				animations {
					"range_anim" {
						frames "walk" range 0, 3
					}
					"list_anim" {
						frames [ "frame1", "frame2", "frame3" ]
					}
					"full_anim" {
						frames "run" range 0, 5
						length 1.5
						loop 0
					}
				}
			}
		`;

		const result = compile<TSpriteSheet>(script, "spritesheet");
		
		expect(result.animations).toEqual({
			"range_anim": { frames: { sprite: "walk", range: [0, 3] } },
			"list_anim": { frames: ["frame1", "frame2", "frame3"] },
			"full_anim": { frames: { sprite: "run", range: [0, 5] }, length: 1.5, loop: 0 }
		});
	});

	it("should parse different ways to define sprites", () => {
		const script = `
			spritesheet "all_types" {
				image "assets/all.png"
				sprites {
					grid 32x32 inc 32, 0 gap 2, 2
					"rect_sprite" {
						rect [10, 10, 20, 20]
					}
					"rects_sprite" {
						rects {
							[0, 0, 10, 10]
							[10, 0, 10, 10]
						}
					}
					"scaled_sprite" scale 2 {
						tiles at 0, 0 count 5
					}
				}
			}
		`;

		const result = compile<TSpriteSheet>(script, "spritesheet");
		
		expect(result.sprites).toEqual([
			{ size: [32, 32], inc: [32, 0], gap: [2, 2] },
			{ name: "rect_sprite", def: [[10, 10, 20, 20]] },
			{ name: "rects_sprite", def: [[[0, 0, 10, 10], [10, 0, 10, 10]]] },
			{ name: "scaled_sprite", scale: 2, def: [{ at: { x: 0, y: 0 }, count: 5 }] }
		]);
	});
});
