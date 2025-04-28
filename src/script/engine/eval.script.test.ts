import { describe, expect, it } from "vitest";
import type { TVars } from "../../types/engine.types";
import { ArgExpression, ArgVariable } from "../../types/value.types";
import { evalExpr, evalNumber, evalValue, evalVar, interpolateString } from "../engine/eval.script";

describe("Script Engine Tests", () => {
	describe("interpolateString", () => {
		// it("should interpolate variables in a string", () => {
		// 	const vars : TVars = new Map([
		// 		["name", "John"],
		// 		["age", 30],
		// 	]);
		// 	const text = "My name is %name% and I am %age% years old.";
		// 	const result = interpolateString({ vars }, text);
		// 	expect(result).toBe("My name is John and I am 30 years old.");
		// });

		it("should handle unknown variables gracefully", () => {
			const vars: TVars = new Map([["name", "John"]]);
			const text = "My name is ${name} and I am ${age} years old.";
			expect(() => interpolateString({ vars }, text)).toThrow(TypeError);
		});

		it("should throw an error if the input is not a string", () => {
			const vars: TVars = new Map();
			const text = 123 as unknown as string;
			expect(() => interpolateString({ vars }, text)).toThrow(TypeError);
		});

		it("should handle empty string", () => {
			const vars: TVars = new Map();
			const text = "";
			const result = interpolateString({ vars }, text);
			expect(result).toBe("");
		});

		it("should handle string without variables", () => {
			const vars: TVars = new Map();
			const text = "Hello World";
			const result = interpolateString({ vars }, text);
			expect(result).toBe("Hello World");
		});
	});

	describe("evalVar", () => {
		it("should evaluate a simple variable", () => {
			const vars: TVars = new Map([["name", "John"]]);
			const result = evalVar({ vars }, "name");
			expect(result).toBe("John");
		});

		it("should evaluate a nested variable", () => {
			const vars: TVars = new Map([["person", { name: "John", age: 30 }]]);
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
			const vars: TVars = new Map([["person", { name: "John" }]]);
			const result = evalVar({ vars }, "person.age");
			expect(result).toBe("");
		});

		it("should throw an error for unknown variable", () => {
			const vars: TVars = new Map();
			expect(() => evalVar({ vars }, "name")).toThrow(TypeError);
		});

		// it("should return empty string for undefined variable", () => {
		// 	const vars : TVars = new Map([["name", undefined]]);
		// 	const result = evalVar({ vars }, "name");
		// 	expect(result).toBe("");
		// });
	});

	describe("evalValue", () => {
		it("should return the input if it's a number", () => {
			const vars: TVars = new Map();
			const result = evalValue({ vars }, 123);
			expect(result).toBe(123);
		});

		it("should return the input if it's an array", () => {
			const vars: TVars = new Map();
			const result = evalValue({ vars }, [1, 2, 3]);
			expect(result).toEqual([1, 2, 3]);
		});

		it("should evaluate a simple variable", () => {
			const vars: TVars = new Map([["name", "John"]]);
			const result = evalValue({ vars }, new ArgVariable("name"));
			expect(result).toBe("John");
		});

		it("should evaluate a string with interpolation", () => {
			const vars: TVars = new Map([["name", "John"]]);
			const result = evalValue({ vars }, "Hello ${name}!");
			expect(result).toBe("Hello John!");
		});

		it("should evaluate a simple expression", () => {
			const vars: TVars = new Map([
				["a", 10],
				["b", 5],
			]);
			const expr = new ArgExpression([new ArgVariable("a"), new ArgVariable("b"), "Plus"]);
			const result = evalValue({ vars }, expr);
			expect(result).toBe(15);
		});

		it("should evaluate a complex expression", () => {
			const vars: TVars = new Map([
				["a", 10],
				["b", 5],
				["c", 2],
			]);
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

	describe("evalNumber", () => {
		it("should return the input if it's a number", () => {
			const vars: TVars = new Map();
			const result = evalNumber({ vars }, 123);
			expect(result).toBe(123);
		});

		it("should evaluate a variable to a number", () => {
			const vars: TVars = new Map([["a", 10]]);
			const result = evalNumber({ vars }, new ArgVariable("a"));
			expect(result).toBe(10);
		});
	});

	describe("evalExpr", () => {
		it("should return the input if it's a number", () => {
			const vars: TVars = new Map();
			const expr = new ArgExpression([1, 1, "Plus", 6, "Multiply"]);
			const result = evalExpr({ vars }, expr);
			expect(result).toBe(12);
		});
	});
});
