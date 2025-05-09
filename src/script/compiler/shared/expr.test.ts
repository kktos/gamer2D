import { describe, expect, it } from "vitest";
import { ArgExpression, ArgVariable } from "../../../types/value.types";
import { compile } from "../compiler";

describe("Expr", () => {
	describe("+ - * /", () => {
		it("should do addition", () => {
			const script = `
			6+6
		`;
			const result = compile(script, "expr");
			expect(result).toEqual(12);
		});

		it("should do substraction", () => {
			const script = `
			12-2-2
		`;
			const result = compile(script, "expr");
			expect(result).toEqual(8);
		});

		it("should do multiplication", () => {
			const script = `
			8*4*2
		`;
			const result = compile(script, "expr");
			expect(result).toEqual(64);
		});

		it("should do division", () => {
			const script = `
			64/2/2
		`;
			const result = compile(script, "expr");
			expect(result).toEqual(16);
		});
	});

	describe("Priorities & Parenthesis", () => {
		it("should respect priorities", () => {
			const script = `
			4-2+4/2*2
		`;
			const result = compile(script, "expr");
			expect(result).toEqual(6);
		});

		it("should deal with sub expr ()", () => {
			const script = `
			(4-2)+4/(2*2)
		`;
			const result = compile(script, "expr");
			expect(result).toEqual(3);
		});
	});

	describe("Variables", () => {
		it("should deal with variables", () => {
			const script = `
				2*$pos+$idx
			`;
			const globals = new Map<string, unknown>([
				["pos", 0],
				["idx", 0],
			]);
			const result = compile(script, "expr", globals);
			expect(result).toEqual(new ArgExpression([2, new ArgVariable("pos"), "Multiply", new ArgVariable("idx"), "Plus"]));
		});
	});

	describe("Negative Numbers", () => {
		it("should deal with negative numbers as second operand", () => {
			const script = `
				2*-1
			`;
			const result = compile(script, "expr");
			expect(result).toEqual(-2);
		});

		it("should deal with negative numbers as first operand", () => {
			const script = `
				-1*2
			`;
			const result = compile(script, "expr");
			expect(result).toEqual(-2);
		});

		it("should deal with negative numbers", () => {
			const script = `
				600+($ypos*-1)
			`;
			const globals = new Map<string, unknown>([["ypos", 0]]);
			const result = compile(script, "expr", globals);
			expect(result).toEqual(new ArgExpression([600, new ArgVariable("ypos"), -1, "Multiply", "Plus"]));
		});
	});
});
