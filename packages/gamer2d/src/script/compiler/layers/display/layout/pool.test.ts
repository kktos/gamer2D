import { describe, expect, it } from "vitest";
import { OP_TYPES } from "../../../../../types/operation.types";
import { ArgVariable } from "../../../../../types/value.types";
import type { TVarTypes } from "../../../../../utils/vars.utils";
import { compileScript } from "../../../compiler";
import type { TLayerDisplaySheet } from "../display.rules";

describe("EntityPool", () => {
	it("should create a pool", () => {
		const script = `
		display "intro" {
			display {
				layout {
					pool "bubblun:life" id:"lifePool" at:0,460 count:10 spawn:$bubblun.lives
				}
			}
		}
		`;
		const globals = new Map<string, TVarTypes>([["bubblun", 0]]);
		const result = compileScript(script, globals);
		expect(result).toBeDefined();

		const displayLayer = result.layers.find((layer) => layer.type === "display") as TLayerDisplaySheet;
		expect(displayLayer).toBeDefined();
		expect(displayLayer).toHaveProperty("layout");

		expect(displayLayer.layout).toEqual([
			{
				type: OP_TYPES.POOL,
				pos: [0, 460],
				sprite: "bubblun:life",
				id: "lifePool",
				count: 10,
				spawn: new ArgVariable("bubblun.lives"),
			},
		]);
	});
	it("should fail if count is missing", () => {
		const script = `
		display "intro" {
			display {
				layout {
					pool "bubblun:life" id:"lifePool" at:0,460 spawn:$bubblun.lives
				}
			}
		}
		`;
		const globals = new Map<string, TVarTypes>([["bubblun", 0]]);
		expect(() => compileScript(script, globals)).toThrowError(/Missing required prop 'count:'/);
	});
});
