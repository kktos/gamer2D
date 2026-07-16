import { describe, expect, it } from "vitest";
import { compile } from "./compiler";
import type { TNeatLayer } from "./types/layers.type";

describe("compiler - layer ui", () => {
	it("should compile a minimal ui layer", () => {
		const scriptText = `
			layer ui "ui" {}
		`;

		const result = compile<TNeatLayer>(scriptText, "layer");

		expect(result).toMatchObject({
			type: "ui",
			name: "ui",
			load: [],
			data: [{ cmd: "CLEARCONTEXT" }],
		});
	});

	it("should compile a ui layer with all supported commands", () => {
		const scriptText = `
			layer ui "ui" {
				$level = 1
				font "PressStart2P", 16
				align left,top
				color red
				bgcolor rgba(1,2,3,0.5)
				zoom 1.5
				on click from ui $x $y { $pressed = true }
				animation bounce paused repeat 3 { $frame = $frame + 1 }

				text "Hello" at center,20 font "PressStart2P", 16 size 50,10 color blue align center,bottom id title nocache anim $anim traits $traits
				
				menu main {
					selection { background darkblue pad 2,3 }
					keys { previous "up" next "down" select "enter" }
					items { item { text "A" at 1,1 } }
				}
				image "sprites/sky.png" at 10,20 repeat 3,4
				sprite "hero" at 1,2 size 16x16 id avatar dir left anim $run traits $move

				rect 0,0,100,30 paint white,black pad 1,1 anim $pulse traits $panel

				pool enemies {
					sprite "ghost"
					capacity 10
					traits $enemyTrait
				}
				view main at 0,0 size 320x240 type game
				for $i of $items as $idx {
					item {
						text "I" at 0,0
					}
				}
				timer tick every 16 ms
				sound music play
				button play at 5,5 size 20,8 pad 1,2 trigger go {
					rect 0,0,20,8 fill black
					text "Play" at 2,2 font "PressStart2P", 12 
				}
			}
		`;

		const result = compile<TNeatLayer>(scriptText, "layer");

		expect(result).toMatchObject({
			type: "ui",
			name: "ui",
			load: [],
			data: [
				{ cmd: "CLEARCONTEXT" },
				{
					cmd: "ASSIGN",
					name: [{ type: "var", name: "level" }],
					value: [{ type: "const", value: 1 }],
				},
				{ cmd: "FONT", name: "PressStart2P", size: 16 },
				{ cmd: "ALIGN", align: "left", valign: "top" },
				{ cmd: "COLOR", color: "red" },
				{ cmd: "BGCOLOR", color: "rgba(1, 2, 3, 0.5)" },
				{ cmd: "ZOOM", value: [{ type: "const", value: 1.5 }] },
				{
					cmd: "ON",
					event: "click",
					from: "ui",
					params: ["x", "y"],
					statements: [
						{
							cmd: "ASSIGN",
							name: [{ type: "var", name: "pressed" }],
							value: [{ type: "const", value: "true" }],
						},
					],
				},
				{
					cmd: "ANIMATION",
					name: "bounce",
					isPaused: true,
					repeat: [{ type: "const", value: 3 }],
					statements: [
						{
							cmd: "ASSIGN",
							name: [{ type: "var", name: "frame" }],
							value: [
								{ type: "var", name: "frame" },
								{ type: "const", value: 1 },
								{ type: "op", op: "+" },
							],
						},
					],
				},
				{
					cmd: "TEXT",
					value: [{ type: "const", value: "Hello" }],
					at: { x: [{ type: "const", value: "center" }], y: [{ type: "const", value: 20 }] },
					font: { name: "PressStart2P", size: 16 },
					size: { width: [{ type: "const", value: 50 }], height: [{ type: "const", value: 10 }] },
					color: [{ type: "const", value: "blue" }],
					boxAlign: { cmd: "ALIGN", align: "center", valign: "bottom" },
					id: "title",
					nocache: true,
					anims: [{ type: "var", name: "anim" }],
					traits: [{ type: "var", name: "traits" }],
				},
				{
					cmd: "MENU",
					id: "main",
					selection: { background: "darkblue", pad: [[{ type: "const", value: 2 }], [{ type: "const", value: 3 }]] },
					keys: {
						previous: [{ type: "const", value: "up" }],
						next: [{ type: "const", value: "down" }],
						select: [{ type: "const", value: "enter" }],
					},
					items: [
						{
							cmd: "ITEM",
							body: [
								{
									cmd: "TEXT",
									value: [{ type: "const", value: "A" }],
									at: { x: [{ type: "const", value: 1 }], y: [{ type: "const", value: 1 }] },
								},
							],
						},
					],
				},
				{
					cmd: "IMAGE",
					source: [{ type: "const", value: "sprites/sky.png" }],
					at: { x: [{ type: "const", value: 10 }], y: [{ type: "const", value: 20 }] },
					repeat: [[{ type: "const", value: 3 }], [{ type: "const", value: 4 }]],
				},
				{
					cmd: "SPRITE",
					name: [{ type: "const", value: "hero" }],
					at: { x: [{ type: "const", value: 1 }], y: [{ type: "const", value: 2 }] },
					size: { width: [{ type: "const", value: 16 }], height: [{ type: "const", value: 16 }] },
					id: "avatar",
					dir: "left",
					anims: [{ type: "var", name: "run" }],
					traits: [{ type: "var", name: "move" }],
				},
				{
					cmd: "RECT",
					at: { x: [{ type: "const", value: 0 }], y: [{ type: "const", value: 0 }] },
					size: { width: [{ type: "const", value: 100 }], height: [{ type: "const", value: 30 }] },
					fill: "black",
					color: "white",
					anims: [{ type: "var", name: "pulse" }],
					traits: [{ type: "var", name: "panel" }],
				},
				{
					cmd: "POOL",
					id: "enemies",
					spriteName: "ghost",
					capacity: [{ type: "const", value: 10 }],
					traits: [{ type: "var", name: "enemyTrait" }],
				},
				{
					cmd: "VIEW",
					type: "game",
					id: "main",
					at: { x: [{ type: "const", value: 0 }], y: [{ type: "const", value: 0 }] },
					size: { width: [{ type: "const", value: 320 }], height: [{ type: "const", value: 240 }] },
				},
				{
					cmd: "FOR",
					var: "i",
					list: [{ type: "var", name: "items" }],
					index: "idx",
					body: [
						{
							cmd: "ITEM",
							body: [
								{
									cmd: "TEXT",
									value: [{ type: "const", value: "I" }],
									at: { x: [{ type: "const", value: 0 }], y: [{ type: "const", value: 0 }] },
								},
							],
						},
					],
				},
				{ cmd: "TIMER", id: "tick", duration: [{ type: "const", value: 16 }], timeScale: 1, kind: "repeat" },
				{ cmd: "SOUND", name: "music", isPaused: false },
				{
					cmd: "BUTTON",
					id: "play",
					at: { x: [{ type: "const", value: 5 }], y: [{ type: "const", value: 5 }] },
					size: { width: [{ type: "const", value: 20 }], height: [{ type: "const", value: 8 }] },
					pad: [[{ type: "const", value: 1 }], [{ type: "const", value: 2 }]],
					trigger: "go",
					body: [
						{
							cmd: "RECT",
							at: { x: [{ type: "const", value: 0 }], y: [{ type: "const", value: 0 }] },
							size: { width: [{ type: "const", value: 20 }], height: [{ type: "const", value: 8 }] },
							fill: "black",
						},
						{
							cmd: "TEXT",
							value: [{ type: "const", value: "Play" }],
							at: { x: [{ type: "const", value: 2 }], y: [{ type: "const", value: 2 }] },
							font: { name: "PressStart2P", size: 12 },
						},
					],
				},
			],
		});
	});
});
