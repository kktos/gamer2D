import { beforeAll, describe, expect, it } from "vitest";
import { OP_TYPES } from "../../../../types/operation.types";
import { ArgIdentifier, ArgVariable, ValueTrait } from "../../../../types/value.types";
import { compile, setWannaLogError } from "../../compiler";

describe("Entities Layers", () => {
	it("should deal with empty layer", () => {
		const script = `
			entities { }
		`;
		const result = compile(script, "entitiesLayerSheet");
		expect(result).toEqual({
			type: "entities",
		});
	});

	describe("settings", () => {
		it("should deal with settings", () => {
			const script = `
			entities {
				settings {show_entities_count = true}
			}
		`;
			const result = compile(script, "entitiesLayerSheet");
			expect(result).toEqual({
				type: "entities",
				settings: {
					show_entities_count: true,
				},
			});
		});
	});

	describe("sprites", () => {
		it("should deal with simple sprites", () => {
			const script = `
			entities {
				sprite "zen-chan" at:16,5 dir:left
				sprite "bubblun" at:16,11 dir:left
			}
		`;
			const result = compile(script, "entitiesLayerSheet");
			expect(result).toEqual({
				type: "entities",
				statements: [
					{
						type: OP_TYPES.SPRITE,
						name: "zen-chan",
						pos: [16, 5],
						dir: 0,
					},
					{
						type: OP_TYPES.SPRITE,
						name: "bubblun",
						pos: [16, 11],
						dir: 0,
					},
				],
			});
		});

		it("should deal with sprites with traits", () => {
			const script = `
			entities {
				sprite "zen-chan" at:16,5 traits:[FakeTrait()]
				sprite "bubblun" at:16,11 traits:[AnotherFakeTrait()]
			}
		`;
			const result = compile(script, "entitiesLayerSheet");
			expect(result).toEqual({
				type: "entities",
				statements: [
					{
						type: OP_TYPES.SPRITE,
						name: "zen-chan",
						pos: [16, 5],
						traits: [new ValueTrait("FakeTrait", [])],
					},
					{
						type: OP_TYPES.SPRITE,
						name: "bubblun",
						pos: [16, 11],
						traits: [new ValueTrait("AnotherFakeTrait", [])],
					},
				],
			});
		});
	});

	describe("for loop", () => {
		beforeAll(() => {
			setWannaLogError(true);
		});
		it("should deal with for..in loop", () => {
			const script = `
			entities {
				for $ypos of [-5,-8,11] {
					sprite "zen-chan" at:17, $ypos dir:left
						traits: [
									ZenChanNormalBehaviourTrait(250, left, 70),
									XDragTrait(600, 70)
								]
				}
			}
		`;
			const result = compile(script, "entitiesLayerSheet");
			expect(result).toEqual({
				type: "entities",
				statements: [
					{
						type: OP_TYPES.REPEAT,
						from: 0,
						count: 0,
						list: [-5, -8, 11],
						var: "ypos",
						items: [
							{
								type: OP_TYPES.SPRITE,
								name: "zen-chan",
								pos: [17, new ArgVariable("ypos")],
								dir: 0,
								traits: [new ValueTrait("ZenChanNormalBehaviourTrait", [250, new ArgIdentifier("left"), 70]), new ValueTrait("XDragTrait", [600, 70])],
							},
						],
					},
				],
			});
		});
	});
});
