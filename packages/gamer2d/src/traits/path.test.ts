import { describe, expect, it } from "vitest";
import { compile } from "../script/compiler/compiler";
import type { TAnimDef } from "../script/compiler/layers/display/layout/defanim.rules";
import { evalArg } from "../script/engine/eval.script";
import { PathTrait, type TPathDefDTO } from "./path.trait";

describe("Path Trait", () => {
	it("should deal with a circle", () => {
		const script = `
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
		`;

		const vars = new Map();
		vars.set("mouseX", 100);

		const result = compile<TAnimDef>(script, "layoutDefAnim", vars);
		expect(result).toBeDefined();

		const trait = new PathTrait(result as unknown as TPathDefDTO, {
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
