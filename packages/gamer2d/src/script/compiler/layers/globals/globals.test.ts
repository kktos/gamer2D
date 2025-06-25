import { beforeEach, describe, expect, it } from "vitest";
import { OP_TYPES } from "../../../../types/operation.types";
import { compileLayerScript } from "../../compiler";

describe("User Defined Layers", () => {
	let _globals: Map<string, unknown>;

	beforeEach(() => {
		_globals = new Map();
	});

	it("should raises an error when the layer is empty", () => {
		const script = `
		layer globals {
		}
		`;
		expect(() => compileLayerScript(script)).toThrow(/No variables defined in globals layer/);
	});

	it("should deal with empty user layer", () => {
		const script = `
		layer globals {
			$p=0
		}
		`;
		const result = compileLayerScript(script);
		expect(result).toBeDefined();
		expect(result).toEqual({ type: "globals", variables: [{ type: OP_TYPES.SET, name: "p", value: 0 }] });
	});
});
