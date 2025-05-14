import { describe, expect, it } from "vitest";
import { ArgExpression, ArgVariable } from "../../types/value.types";
import { type TVarTypes, TVars } from "../../utils/vars.utils";
import { evalExpr, evalNumber, evalValue, evalVar, interpolateString } from "../engine/eval.script";

describe.skip("Script Engine Tests", () => {
	const globals = new Map<string, TVarTypes>([
		["name", "John"],
		["age", 30],
		["person", { name: "John", age: 30 }],
		["a", 10],
		["b", 5],
		["c", 2],
	]);
	const vars = new TVars(globals);

	describe.skip("interpolateString", () => {
		it("should handle unknown variables gracefully", () => {
			const text = "My name is ${name0} and I am ${age0} years old.";
			expect(() => interpolateString({ vars }, text)).toThrow(TypeError);
		});
		it("should throw an error if the input is not a string", () => {
			const text = 123 as unknown as string;
			expect(() => interpolateString({ vars }, text)).toThrow(TypeError);
		});
		it("should handle empty string", () => {
			const text = "";
			const result = interpolateString({ vars }, text);
			expect(result).toBe("");
		});
		it("should handle string without variables", () => {
			const text = "Hello World";
			const result = interpolateString({ vars }, text);
			expect(result).toBe("Hello World");
		});
	});

	describe.skip("evalVar", () => {
		it("should evaluate a simple variable", () => {
			const result = evalVar({ vars }, "name");
			expect(result).toBe("John");
		});

		it("should evaluate a nested variable", () => {
			const result = evalVar({ vars }, "person.name");
			expect(result).toBe("John");
		});

		// it("should evaluate a nested variable with variable parameter", () => {
		// 	const vars : TVars = new Map([
		// 		["person", { name: "John", age: 30 }],
		// 		["prop", "name"],
		// 	]);
		// 	const result = evalVar({ vars }, "person.$prop");
		// 	expect(result).toBe("John");
		// });

		it("should return empty string for undefined nested variable", () => {
			const result = evalVar({ vars }, "person.page");
			expect(result).toBe("");
		});

		it("should throw an error for unknown variable", () => {
			expect(() => evalVar({ vars }, "plate")).toThrow(TypeError);
		});

		// it("should return empty string for undefined variable", () => {
		// 	const vars : TVars = new Map([["name", undefined]]);
		// 	const result = evalVar({ vars }, "name");
		// 	expect(result).toBe("");
		// });
	});

	describe.skip("evalValue", () => {
		it("should return the input if it's a number", () => {
			const result = evalValue({ vars }, 123);
			expect(result).toBe(123);
		});

		it("should return the input if it's an array", () => {
			const result = evalValue({ vars }, [1, 2, 3]);
			expect(result).toEqual([1, 2, 3]);
		});

		it("should evaluate a simple variable", () => {
			const result = evalValue({ vars }, new ArgVariable("name"));
			expect(result).toBe("John");
		});

		it("should evaluate a string with interpolation", () => {
			const result = evalValue({ vars }, "Hello ${name}!");
			expect(result).toBe("Hello John!");
		});

		it("should evaluate a simple expression", () => {
			const expr = new ArgExpression([new ArgVariable("a"), new ArgVariable("b"), "Plus"]);
			const result = evalValue({ vars }, expr);
			expect(result).toBe(15);
		});

		it("should evaluate a complex expression", () => {
			const expr = new ArgExpression([new ArgVariable("a"), new ArgVariable("b"), "Plus", new ArgVariable("c"), "Multiply"]);
			const result = evalValue({ vars }, expr);
			expect(result).toBe(30);
		});

		// it("should evaluate a boolean expression", () => {
		// 	const vars: TVars = new Map([
		// 		["a", 10],
		// 		["b", 5],
		// 	]);
		// 	const result = evalValue({ vars }, { expr: "$a > $b" });
		// 	expect(result).toBe(true);
		// });
	});

	describe.skip("evalNumber", () => {
		it("should return the input if it's a number", () => {
			const result = evalNumber({ vars }, 123);
			expect(result).toBe(123);
		});

		it("should evaluate a variable to a number", () => {
			const result = evalNumber({ vars }, new ArgVariable("a"));
			expect(result).toBe(10);
		});
	});

	describe.skip("evalExpr", () => {
		it("should return the input if it's a number", () => {
			const expr = new ArgExpression([1, 1, "Plus", 6, "Multiply"]);
			const result = evalExpr({ vars }, expr);
			expect(result).toBe(12);
		});
	});
});
