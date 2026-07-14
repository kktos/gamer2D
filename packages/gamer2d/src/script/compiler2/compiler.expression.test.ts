import { describe, expect, it } from "vitest";
import { compile } from "./compiler";
import { TNeatExpression } from "./types/expression.type";

describe("compiler - expression", () => {
	it("should compile a mathematical expression", () => {
		const script = "1 + 2 / ($x + 3)";
		const result = compile<TNeatExpression>(script, "expression");
		
		expect(result).toStrictEqual({
			op: "+",
			left: 1,
			right: {
				op: "/",
				left: 2,
				right: {
					op: "+",
					left: { variable: "x" },
					right: 3
				}
			}
		});
	});

	it("should compile a negative number expression", () => {
		const script = "-50";
		const result = compile<TNeatExpression>(script, "expression");
		expect(result).toBeTruthy();
	});

	it("should compile complex chained method expressions", () => {
		const script = 'sprite(foo(1).bar(2)).set("mass", 1)';
		const result = compile<TNeatExpression>(script, "expression");
		expect(result).toBeTruthy();
	});
});
