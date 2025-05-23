import { beforeAll, describe, expect, it } from "vitest";
import { OP_TYPES } from "../../../../../types/operation.types";
import { ArgColor, ArgExpression, ArgVariable } from "../../../../../types/value.types";
import { compile, setWannaLogError } from "../../../compiler";

describe("Text", () => {
	beforeAll(() => {
		setWannaLogError(true);
	});

	it("should create a text with ID", () => {
		const script = `text "Hello World" id:"test" at:110,428`;
		const text = compile(script, "layoutText");
		expect(text).toEqual({
			id: "test",
			pos: [110, 428],
			type: OP_TYPES.TEXT,
			text: "Hello World",
		});
	});

	it("should create a text with position using expressions", () => {
		const script = `text "Hello World" id:"test" at:$posX*2,428`;
		const globals = new Map<string, unknown>([["posX", 80]]);
		const text = compile(script, "layoutText", globals);
		expect(text).toEqual({
			id: "test",
			pos: [new ArgExpression([new ArgVariable("posX"), 2, "Multiply"]), 428],
			type: OP_TYPES.TEXT,
			text: "Hello World",
		});
	});

	it("should create a text using all props", () => {
		const script = `text "Hello World" id:"test" at:$posX*2,428 width:10 height:20 anim:"test" align:left valign:top size:2 color:red background:blue traits:$traitOne`;
		const globals = new Map<string, unknown>([
			["posX", 80],
			["traitOne", []],
		]);
		const text = compile(script, "layoutText", globals);
		expect(text).toEqual({
			id: "test",
			pos: [new ArgExpression([new ArgVariable("posX"), 2, "Multiply"]), 428],
			type: OP_TYPES.TEXT,
			text: "Hello World",
			anim: { name: "test" },
			align: 1,
			valign: 3,
			size: 2,
			color: new ArgColor("red"),
			bgcolor: new ArgColor("blue"),
			width: 10,
			height: 20,
			traits: new ArgVariable("traitOne"),
		});
	});

	it("should handle bad text definition", () => {
		const script = `text id:"test" at:80,428`;
		expect(() => compile(script, "layoutText")).toThrowError(
			expect.objectContaining({
				line: 1,
				word: "id",
			}),
		);
	});
});
