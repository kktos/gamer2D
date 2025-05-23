import { describe, expect, it } from "vitest";
import { ArgVariable } from "../../../types/value.types";
import { compile } from "../compiler";
import type { TSet } from "../layers/display/layout/set.rules";

describe("Variables", () => {
	it("should set  a variable from a global variable", () => {
		const script = `
			$fadein = $highScore
		`;

		const vars = new Map();
		vars.set("highScore", 0);

		const result = compile<TSet>(script, "layoutSet", vars);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("value", new ArgVariable("highScore"));
	});
});
