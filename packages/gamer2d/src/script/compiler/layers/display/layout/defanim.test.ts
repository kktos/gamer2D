import { describe, expect, it } from "vitest";
import { OP_TYPES } from "../../../../../types/operation.types";
import { ArgColor, ArgIdentifier, ArgVariable } from "../../../../../types/value.types";
import { compileScript } from "../../../compiler";
import type { TLayerDisplaySheet } from "../display.rules";

describe("Def Anim", () => {
	it("should define an anim on path", () => {
		const script = `
		display "intro" {
			display {
				layout {

					$xpos=380
					$ypos=300
					$radius=20
					
					def anim "clockwise" {
						path { 
							circle($xpos,$ypos,$radius,0)
							loop()
						}
						speed 20
					}

				}
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();

		const displayLayer = result.layers.find((layer) => layer.type === "display") as TLayerDisplaySheet;
		expect(displayLayer).toBeDefined();
		expect(displayLayer).toHaveProperty("layout");

		const anim = displayLayer.layout?.filter((op) => op.type === OP_TYPES.ANIM);

		expect(anim).toEqual([
			{
				type: OP_TYPES.ANIM,
				name: "clockwise",
				speed: 20,
				path: [
					[
						{
							name: ["circle"],
							args: [new ArgVariable("xpos"), new ArgVariable("ypos"), new ArgVariable("radius"), 0],
						},
					],
					[{ name: ["loop"], args: [] }],
				],
			},
		]);
	});

	it("should define an anim on path", () => {
		const script = `
		display "intro" {
			display {
				layout {

					def anim "fadeout" {
						path {
							prop("color",#00000001)
							prop("name","X:%mouseX%")
							dir(left)
							loop()
						}
					}

				}
			}
		}
		`;

		const result = compileScript(script);
		expect(result).toBeDefined();
		const displayLayer = result.layers.find((layer) => layer.type === "display");
		expect(displayLayer).toBeDefined();
		expect(displayLayer).toHaveProperty("layout");

		expect(displayLayer).toStrictEqual({
			type: "display",
			layout: [
				{
					type: OP_TYPES.ANIM,
					name: "fadeout",
					path: expect.arrayContaining([
						[{ name: ["prop"], args: ["color", new ArgColor("#00000001")] }],
						[{ name: ["prop"], args: ["name", "X:%mouseX%"] }],
						[{ name: ["dir"], args: [new ArgIdentifier("left")] }],
						[{ name: ["loop"], args: [] }],
					]),
				},
			],
		});
	});
});
