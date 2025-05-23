import { describe, expect, it } from "vitest";
import { OP_TYPES } from "../../../types/operation.types";
import { ArgColor, ArgExpression, ArgIdentifier, ArgVariable } from "../../../types/value.types";
import { compile, compileScript } from "../compiler";
import type { TLayerDisplaySheet } from "../layers/display/display.rules";

describe("Action", () => {
	it("should define a simple action", () => {
		const script = `
		display "intro" {
			display {
				on "FAKE" {
					$myVar = 3
					call(1,2,3)
				}
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();

		const displayLayer = result.layers.find((layer) => layer.type === "display") as TLayerDisplaySheet;
		expect(displayLayer).toBeDefined();
		expect(displayLayer.on).toEqual({
			FAKE: {
				action: [{ name: "myVar", type: OP_TYPES.SET, value: 3 }, [{ name: ["SYSTEM", "call"], args: [1, 2, 3] }]],
			},
		});
	});

	describe("actionFunctionCallList", () => {
		it("should parse a single system function call", () => {
			const script = `call(1, "test")`;
			// We compile using actionStatement which calls actionFunctionCallList
			const result = compile(script, "actionStatement");
			expect(result).toEqual([
				{
					name: ["SYSTEM", "call"], // "SYSTEM" should be prepended
					args: [1, "test"],
				},
			]);
		});

		it("should parse a single non-system function call when noSystem is true", () => {
			const script = "myFunc(1)";
			// Pass actionOptions with noSystem: true
			const result = compile(script, "actionStatement", undefined, { noSystem: true });
			expect(result).toEqual([
				{
					name: ["myFunc"], // "SYSTEM" should NOT be prepended
					args: [1],
				},
			]);
		});

		it("should parse chained function calls (system first)", () => {
			const script = `call(1).next("arg").another()`;
			const result = compile(script, "actionStatement");
			expect(result).toEqual([
				{
					name: ["SYSTEM", "call"], // "SYSTEM" prepended to the first call
					args: [1],
				},
				{
					name: ["next"],
					args: ["arg"],
				},
				{
					name: ["another"],
					args: [],
				},
			]);
		});

		it("should parse chained function calls (object method style)", () => {
			const script = "myObject.method(true).another(null)"; // null is parsed as an identifier
			const result = compile(script, "actionStatement");
			expect(result).toEqual([
				{
					name: ["myObject", "method"],
					args: [true], // true/false are identifiers here
				},
				{
					name: ["another"],
					args: [new ArgIdentifier("null")],
				},
			]);
		});

		it("should parse chained function calls (object method style, noSystem)", () => {
			const script = "myObject.method(true).another(null)";
			const result = compile(script, "actionStatement");
			expect(result).toEqual([
				{
					name: ["myObject", "method"], // No SYSTEM prepended
					args: [true],
				},
				{
					name: ["another"],
					args: [new ArgIdentifier("null")],
				},
			]);
		});

		it("should parse function call with various argument types", () => {
			const script = 'func("string", 123, $var, ident, #FF00AA, left, $var*2)';
			const globals = new Map([["var", 0]]);
			const result = compile(script, "actionStatement", globals);
			expect(result).toEqual([
				{
					name: ["SYSTEM", "func"],
					args: [
						"string",
						123,
						new ArgVariable("var"),
						new ArgIdentifier("ident"),
						new ArgColor("#FF00AA"),
						new ArgIdentifier("left"),
						new ArgExpression([new ArgVariable("var"), 2, "Multiply"]),
					],
				},
			]);
		});

		it("should parse function names that are keywords", () => {
			const script = 'Timer("t1").Sprite("s1").Dir(left)';
			const result = compile(script, "actionStatement");
			expect(result).toEqual([
				{ name: ["SYSTEM", "Timer"], args: ["t1"] },
				{ name: ["Sprite"], args: ["s1"] },
				{ name: ["Dir"], args: [new ArgIdentifier("left")] },
			]);
		});

		it("should parse method call from a variable", () => {
			const script = "$myvar.method(true)"; // null is parsed as an identifier
			const result = compile(script, "actionStatement");

			console.log(result);

			expect(result).toEqual([
				{
					name: [new ArgVariable("myvar"), "method"],
					args: [true], // true/false are identifiers here
				},
			]);
		});
	});
});
