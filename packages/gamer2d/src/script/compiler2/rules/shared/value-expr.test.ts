import { describe, expect, it } from "vitest";
import { NeatParser } from "../../parser";
import { parseValueExpression } from "./value-expr.rule";

function parse(code: string): unknown {
	const parser = new NeatParser();
	parser.lexer.tokenize(code);
	return parseValueExpression(parser);
}

describe("parseValueExpression with function/method calls", () => {
	// it("should parse simple function calls", () => {
	// 	const ast = parse("foo(1, 2)");
	// 	expect(ast).toMatchObject(new NeatFnCall("foo", [1, 2]));
	// });

	// it("should handle method calls", () => {
	// 	const ast = parse("foo(1).bar(2)");
	// 	expect(ast).toStrictEqual({
	// 		cmd: "CALL",
	// 		path: [new NeatFnCall("foo", [1]), new NeatFnCall("bar", [2])],
	// 	});
	// });

	// it("should parse nested expressions as arguments", () => {
	// 	const ast = parse("sum(1 + 2, $x * 3)");
	// 	expect(ast).toStrictEqual(
	// 		new NeatFnCall("sum", [
	// 			{ op: "+", left: 1, right: 2 },
	// 			{ op: "*", left: { variable: "x" }, right: 3 },
	// 		]),
	// 	);
	// });

	it("should parse nested expressions in expressions", () => {
		const ast = parse("1 + 2 /($x + 3))");
		expect(ast).toStrictEqual({ op: "/", left: { op: "+", left: 1, right: 2 }, right: { op: "+", left: { variable: "x" }, right: 3 } });
	});

	it("should support complex chains with expressions", () => {
		const ast = parse(`sprite(foo(1).bar(2)).set("mass", 1)`);
		expect(ast).toBeTruthy(); // ensure no parse error
	});

	it("should evaluate negative number", () => {
		const ast = parse("-50");
		expect(ast).toBeTruthy(); // ensure no parse error
	});
});
