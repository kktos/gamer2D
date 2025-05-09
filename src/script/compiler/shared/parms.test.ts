import { beforeAll, describe, expect, it } from "vitest";
import { ArgColor, ArgVariable, ValueTrait } from "../../../types/value.types";
import { compile, setWannaLogError } from "../compiler";

describe("ParmsRules", () => {
	beforeAll(() => {
		setWannaLogError(true);
	});

	describe("parm_traits with a variable", () => {
		it("should parse traits from an array variable", () => {
			const script = "traits:$traitList";
			const trait1 = new ValueTrait("TestTrait1", []);
			const trait2 = new ValueTrait("TestTrait2", []);
			const traitListVar = new ArgVariable("traitList");
			const parserGlobals = new Map<string, unknown>([
				["trait1", trait1],
				["trait2", trait2],
				["traitList", [new ArgVariable("trait1"), new ArgVariable("trait2")]],
			]);

			const result = compile(script, "parm_traits", parserGlobals);
			expect(result).toEqual(traitListVar);
		});

		it("should throw if variable array elements are not trait variables", () => {
			// Test case 1: Variable holding an array with a non-trait variable inside
			const script1 = "traits:$traitList";
			const globals1 = new Map<string, unknown>([
				["trait1", new ArgVariable("trait1")],
				["notATraitVar", 0],
				["traitList", [new ArgVariable("trait1"), new ArgVariable("notATraitVar")]], // Array holds refs
			]);
			// The validation needs the actual values during compile time for this rule
			const parserGlobals1 = new Map<string, unknown>([
				["trait1", new ValueTrait("trait1", [])],
				["notATraitVar", 0], // The value of notATraitVar is not a Trait
				["traitList", [new ArgVariable("trait1"), new ArgVariable("notATraitVar")]],
			]);
			expect(() => compile(script1, "parm_traits", parserGlobals1)).toThrowError(/Variable "notATraitVar" is not a trait/);

			// Test case 2: Inline array with a variable that doesn't hold a trait
			// const script2 = "traits:[$trait1, $notATraitVar]";
			// const globals2 = new Map<string, unknown>([
			// 	["trait1", [new ValueTrait("trait1", [])]],
			// 	["notATraitVar", 0], // notATraitVar exists but doesn't hold a trait
			// ]);
			// expect(() => compile(script2, "parm_traits", globals2)).toThrowError(/Variable "notATraitVar" is not a trait/);
		});
	});

	describe("parm_traits with an array of variables", () => {
		it("should parse traits from an inline array of variables", () => {
			const script = "traits:[$trait1, $trait2]";
			const globals = new Map<string, unknown>([
				["trait1", new ValueTrait("TestTrait1", [])],
				["trait2", new ValueTrait("TestTrait2", [])],
			]);
			const result = compile(script, "parm_traits", globals);
			expect(result).toEqual([new ArgVariable("trait1"), new ArgVariable("trait2")]);
		});

		it("should throw if variable is not an array", () => {
			const script = "traits:$notAnArray";
			const globals = new Map<string, unknown>([
				["trait1", new ValueTrait("TestTrait1", [])],
				["notAnArray", 0], // The variable holds a non-array value
			]);
			expect(() => compile(script, "parm_traits", globals)).toThrowError(/Variable "notAnArray" is not an array of traits/);
		});

		it("should throw if inline array contains non-variables", () => {
			const script = "traits:[$trait1, 123]";
			const globals = new Map<string, unknown>([["trait1", []]]);
			// The error comes from the arrayOfVars rule called by varOrArrayOfVars
			expect(() => compile(script, "parm_traits", globals)).toThrowError(/SYNTAX ERROR LINE 1 at "123"/);
		});

		it("should throw if inline array contains unknown variables", () => {
			const script = "traits:[$trait1, $unknown]";
			const globals = new Map<string, unknown>([
				["trait1", []],
				// $unknown is not defined in globals
			]);
			expect(() => compile(script, "parm_traits", globals)).toThrowError(/Unknown variable "unknown"/);
		});
	});

	describe("parm_traits with an array of trait declarations", () => {
		it("should parse traits from an inline array of variables", () => {
			const script = "traits:[FadeTrait(1,#ff0000), MouseXTrait()]";
			const result = compile(script, "parm_traits");
			expect(result).toEqual([new ValueTrait("FadeTrait", [1, new ArgColor("#ff0000")]), new ValueTrait("MouseXTrait", [])]);
		});
	});
});
