import { describe, expect, it } from "vitest";
import { compileScript } from "../script/compiler/compiler";
import { evalArg } from "../script/engine/eval.script";
import { PathTrait } from "./path.trait";

describe("Path Trait", () => {
	it("should deal with a circle", () => {
		const script = `
		display "intro" {
			display {
				layout {

					def anim "clockwise" {
						path { 
							circle(380,300,20,0)
							dir(Left)
							prop("color",#00000001)
							prop("name","X:%mouseX%")
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

		const vars = new Map();
		vars.set("mouseX", 100);

		const displayLayer = result.layers.find((layer) => layer.type === "display");
		expect(displayLayer).toBeDefined();
		expect(displayLayer).toHaveProperty("layout");

		const trait = new PathTrait(displayLayer.layout[0], {
			evalArg: (arg) => {
				const rez = evalArg({ vars }, arg); /*console.log(arg,rez);*/
				return rez;
			},
		});
		expect(trait).toBeDefined();
		expect(trait).toHaveProperty("pointProviders");

		// biome-ignore lint/complexity/useLiteralKeys: <explanation>
		expect(trait["pointProviders"][0]).toBeInstanceOf(Function);
	});
});
