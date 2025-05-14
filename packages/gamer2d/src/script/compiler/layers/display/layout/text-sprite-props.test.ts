import { describe, expect, it } from "vitest";
import { DIRECTIONS } from "../../../../../types/direction.type";
import { compile } from "../../../compiler";

describe("TextSpriteProps", () => {
	describe("parm_dir", () => {
		it("should parse dir:left", () => {
			const script = "dir:left";
			const result = compile(script, "parm_dir");
			expect(result).toBe(DIRECTIONS.LEFT);
		});

		it("should parse dir:right", () => {
			const script = "dir:right";
			const result = compile(script, "parm_dir");
			expect(result).toBe(DIRECTIONS.RIGHT);
		});

		it("should parse dir:right", () => {
			const script = "dir:0";
			expect(() => compile(script, "parm_dir")).toThrowError(/SYNTAX ERROR LINE 1 at "0"/);

			// const result = compile(script, "parm_dir");
			// expect(result).toBe(DIRECTIONS.RIGHT);
		});
	});
});
