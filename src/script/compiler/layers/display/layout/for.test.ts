import { describe, expect, it } from "vitest";
import { DIRECTIONS } from "../../../../../types/direction.type";
import { OP_TYPES } from "../../../../../types/operation.types";
import { ArgExpression, ArgIdentifier, ArgVariable, ValueTrait } from "../../../../../types/value.types";
import { compile } from "../../../compiler";

describe("For", () => {
	it("should do a for loop", () => {
		const script = `
			for $idx 0,10 {
				text $positions.$idx at:90,$Ypos+$idx*40
				text $highscores.$idx.score at:250,$Ypos+$idx*40
			}
		`;
		const vars = new Map<string, unknown>();
		vars.set("positions", 0);
		vars.set("highscores", 0);
		vars.set("Ypos", 0);

		const result = compile(script, "layoutFor", vars);
		expect(result).toEqual({
			type: OP_TYPES.REPEAT,
			from: 0,
			count: 10,
			index: "idx",
			items: [
				{
					type: OP_TYPES.TEXT,
					text: new ArgVariable("positions.$idx"),
					pos: [90, new ArgExpression([new ArgVariable("Ypos"), new ArgVariable("idx"), 40, "Multiply", "Plus"])],
				},
				{
					type: OP_TYPES.TEXT,
					text: new ArgVariable("highscores.$idx.score"),
					pos: [250, new ArgExpression([new ArgVariable("Ypos"), new ArgVariable("idx"), 40, "Multiply", "Plus"])],
				},
			],
		});
	});

	it("should do a for..of loop using varList", () => {
		const script = `
			for $menuItem of $menuItems index:$idx{
				text $menuItem at:90,$Ypos+$idx*40
			}
		`;
		const vars = new Map<string, unknown>();
		vars.set("Ypos", 0);
		vars.set("menuItems", ["play", "intro"]);

		const result = compile(script, "layoutFor", vars);
		expect(result).toEqual({
			type: OP_TYPES.REPEAT,
			from: 0,
			count: 0,
			var: "menuItem",
			list: "menuItems",
			index: "idx",
			items: [
				{
					type: OP_TYPES.TEXT,
					text: new ArgVariable("menuItem"),
					pos: [90, new ArgExpression([new ArgVariable("Ypos"), new ArgVariable("idx"), 40, "Multiply", "Plus"])],
				},
			],
		});
	});

	it("should do a for..of loop using array", () => {
		const script = `
			for $menuItem of ["play","intro"] index:$idx {
				text $menuItem at:90,$Ypos+$idx*40
			}
		`;
		const vars = new Map<string, unknown>();
		vars.set("Ypos", 0);

		const result = compile(script, "layoutFor", vars);
		expect(result).toEqual({
			type: OP_TYPES.REPEAT,
			from: 0,
			count: 0,
			var: "menuItem",
			list: ["play", "intro"],
			index: "idx",
			items: [
				{
					type: OP_TYPES.TEXT,
					text: new ArgVariable("menuItem"),
					pos: [90, new ArgExpression([new ArgVariable("Ypos"), new ArgVariable("idx"), 40, "Multiply", "Plus"])],
				},
			],
		});
	});

	it("should do a for..of loop with iterator var", () => {
		const script = `
			for $menuItem of ["play","intro"] index:$idx {
				text $menuItem at:90,$Ypos+$idx*40
			}
		`;
		const vars = new Map<string, unknown>();
		vars.set("Ypos", 0);
		const result = compile(script, "layoutFor", vars);
		expect(result).toEqual({
			type: OP_TYPES.REPEAT,
			from: 0,
			count: 0,
			var: "menuItem",
			list: ["play", "intro"],
			index: "idx",
			items: [
				{
					type: OP_TYPES.TEXT,
					text: new ArgVariable("menuItem"),
					pos: [90, new ArgExpression([new ArgVariable("Ypos"), new ArgVariable("idx"), 40, "Multiply", "Plus"])],
				},
			],
		});
	});

	it("should do a for..of loop with traits", () => {
		const script = `
			for $ypos of [-5,-8,-11] index:$idx {
				sprite "zen-chan" at:17, $ypos dir:left
					traits: [
								ZenChanNormalBehaviourTrait(250, left, 70),
								XDragTrait(600+($idx*400), 70)
							]
			}
		`;
		const vars = new Map<string, unknown>();
		vars.set("Ypos", 0);
		const result = compile(script, "layoutFor", vars);
		expect(result).toEqual({
			type: OP_TYPES.REPEAT,
			from: 0,
			count: 0,
			var: "ypos",
			list: [-5, -8, -11],
			index: "idx",
			items: [
				{
					type: OP_TYPES.SPRITE,
					dir: DIRECTIONS.LEFT,
					name: "zen-chan",
					pos: [17, new ArgVariable("ypos")],
					traits: [
						new ValueTrait("ZenChanNormalBehaviourTrait", [250, new ArgIdentifier("left"), 70]),
						new ValueTrait("XDragTrait", [new ArgExpression([600, new ArgVariable("idx"), 400, "Multiply", "Plus"]), 70]),
					],
				},
			],
		});
	});

	it("should raise an error when using unknown var in loop", () => {
		const script = `
			for $idx 0,10 {
				text $idx at:90,$Ypos
			}
		`;
		expect(() => compile(script, "layoutFor")).toThrowError(/Unknown variable "Ypos"/);
	});
});
