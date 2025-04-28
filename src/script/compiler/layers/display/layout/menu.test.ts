import { describe, expect, it } from "vitest";
import { OP_TYPES } from "../../../../../types/operation.types";
import { ArgColor, ArgVariable } from "../../../../../types/value.types";
import { compileScript } from "../../../compiler";

describe("Menu", () => {
	it("should create a simple menu", () => {
		const script = `
		display "intro" {
			layout {
				menu {
					items {
						text "play" at:300,230 action:{ goto("play") }
						text "intro" at:300,280 action:{ goto("intro") }
						text "game" at:300,330
					}
				}
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("layout");
		expect(Array.isArray(result.layout)).toBe(true);

		const menu = result.layout.find((op) => op.type === OP_TYPES.MENU);

		expect(menu).toEqual({
			type: OP_TYPES.MENU,
			items: [
				{
					type: OP_TYPES.TEXT,
					pos: [300, 230],
					text: "play",
					action: [[{ args: ["play"], name: ["SYSTEM", "goto"] }]],
				},
				{
					type: OP_TYPES.TEXT,
					pos: [300, 280],
					text: "intro",
					action: [[{ args: ["intro"], name: ["SYSTEM", "goto"] }]],
				},
				{
					type: OP_TYPES.TEXT,
					pos: [300, 330],
					text: "game",
				},
			],
		});
	});

	it("should create a menu with grouped items", () => {
		const script = `
		display "intro" {
			layout {
				menu {
					items {
						item { text "play" at:300,230 } action:{ goto("play") }
						item { text "intro" at:300,280 sprite "boom" at:350,280 } action:{ goto("intro") }
						item { text "game" at:300,330 }
					}
				}
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("layout");
		expect(Array.isArray(result.layout)).toBe(true);

		const menu = result.layout.find((op) => op.type === OP_TYPES.MENU);

		expect(menu).toEqual({
			type: OP_TYPES.MENU,
			items: [
				{
					type: OP_TYPES.GROUP,
					items: [
						{
							type: OP_TYPES.TEXT,
							pos: [300, 230],
							text: "play",
						},
					],
					action: [[{ args: ["play"], name: ["SYSTEM", "goto"] }]],
				},
				{
					type: OP_TYPES.GROUP,
					items: [
						{
							type: OP_TYPES.TEXT,
							pos: [300, 280],
							text: "intro",
						},
						{
							type: OP_TYPES.SPRITE,
							pos: [350, 280],
							sprite: "boom",
							zoom: 1,
						},
					],
					action: [[{ args: ["intro"], name: ["SYSTEM", "goto"] }]],
				},
				{
					type: OP_TYPES.GROUP,
					items: [
						{
							type: OP_TYPES.TEXT,
							pos: [300, 330],
							text: "game",
						},
					],
				},
			],
		});
	});

	it("should create a menu with for loop", () => {
		const script = `
		display "intro" {
			layout {
				$menuItems = [
					"play",
					"intro",
					"game",
					"highscores",
					"DEBUG"
				]
				$scenes = [
					"splashscreen",
					"intro",
					"game",
					"highscores",
					"debug"
				]

				menu {
					items {
						for $menuItem of $menuItems {
							item {text $menuItem at:300,180} action:{ goto($scene.$idx) }
						}
					}
				}
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("layout");
		expect(Array.isArray(result.layout)).toBe(true);

		const menu = result.layout.find((op) => op.type === OP_TYPES.MENU);

		expect(menu).toEqual({
			type: OP_TYPES.MENU,
			items: [
				{
					type: OP_TYPES.REPEAT,
					count: 0,
					from: 0,
					var: "menuItem",
					list: "menuItems",
					items: [
						{
							type: OP_TYPES.GROUP,
							action: [[{ args: [new ArgVariable("scene.$idx")], name: ["SYSTEM", "goto"] }]],
							items: [
								{
									type: OP_TYPES.TEXT,
									pos: [300, 180],
									text: new ArgVariable("menuItem"),
								},
							],
						},
					],
				},
			],
		});
	});

	it("should create a menu full options", () => {
		const script = `
		display "intro" {
			layout {
				$menuItems = [
					"play",
					"intro",
					"game",
					"highscores",
					"DEBUG"
				]

				menu {
					selection {
						color yellow
						var $selectedIdx
						background #faee005e
					}
					keys {
					   previous : ["ArrowUp", "ArrowLeft"]
						   next : ["ArrowDown", "ArrowRight"]
						 select : ["Enter"]
					}
					items {
						for $menuItem of $menuItems {
							item {text $menuItem at:300,180}
						}
					}
				}
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("layout");
		expect(Array.isArray(result.layout)).toBe(true);

		const menu = result.layout.find((op) => op.type === OP_TYPES.MENU);

		expect(menu).toEqual({
			type: OP_TYPES.MENU,
			selection: {
				background: new ArgColor("#faee005e"),
				color: new ArgColor("yellow"),
				var: "selectedIdx",
			},
			keys: {
				previous: ["ArrowUp", "ArrowLeft"],
				next: ["ArrowDown", "ArrowRight"],
				select: ["Enter"],
			},
			items: [
				{
					type: OP_TYPES.REPEAT,
					count: 0,
					from: 0,
					var: "menuItem",
					list: "menuItems",
					items: [
						{
							type: OP_TYPES.GROUP,
							items: [
								{
									type: OP_TYPES.TEXT,
									pos: [300, 180],
									text: new ArgVariable("menuItem"),
								},
							],
						},
					],
				},
			],
		});
	});
});
