import { describe, expect, it } from "vitest";
import { OP_TYPES } from "../../../../types/operation.types";
import { ArgColor, ArgVariable, ValueTrait } from "../../../../types/value.types";
import { compileScript } from "../../compiler";

describe("TextSpriteProps", () => {
	it("should deal with array of traits", () => {
		const script = `
		display "intro" {
			layout {

				$fadein = trait FadeTrait("in", #00000000)
				$mousX =  trait MouseXTrait()
				$count =  0

				text "" at:298,104 color:#FFFFFF traits:[$fadein, $mousX]
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("layout");
		expect(Array.isArray(result.layout)).toBe(true);

		const fadein = result.layout.find((op) => op.name === "fadein");
		expect(fadein).toBeDefined();
		expect(fadein).toHaveProperty("type", OP_TYPES.SET);
		expect(fadein).toHaveProperty("value", new ValueTrait("FadeTrait", ["in", new ArgColor("#00000000")]));

		const mousX = result.layout.find((op) => op.name === "mousX");
		expect(mousX).toBeDefined();
		expect(mousX).toHaveProperty("type", OP_TYPES.SET);
		expect(mousX).toHaveProperty("value", new ValueTrait("MouseXTrait", []));

		const text = result.layout.find((op) => op.type === OP_TYPES.TEXT);
		expect(text).toBeDefined();
		expect(text).toHaveProperty("traits", [new ArgVariable("fadein"), new ArgVariable("mousX")]);
	});

	it("should allow traits only as param", () => {
		const script = `
		display "intro" {
			layout {

				$fadein = trait FadeTrait("in", #00000000)
				$mousX =  trait MouseXTrait()
				$count =  0

				traits [$fadein, $mousX]

				text "" at:298,104 color:#FFFFFF 
			}
		}
		`;
		expect(() => compileScript(script)).toThrowError(/traits can only be used as a param/);
	});

	it("should allow traits as variable", () => {
		const script = `
		display "intro" {
			layout {

				$fadein = trait FadeTrait("in", #00000000)
				$mousX =  trait MouseXTrait()
				$count =  0

				$toto= [$fadein]

				text "" at:298,104 color:#FFFFFF traits:$toto
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();

		// expect(() => compileScript(script)).toThrowError(/traits can only be used as a param/)
	});

	it("should allow only an array as variable", () => {
		const script = `
		display "intro" {
			layout {

				$fadein = trait FadeTrait("in", #00000000)
				$mousX =  trait MouseXTrait()
				$count =  0

				$toto= 0

				text "" at:298,104 color:#FFFFFF traits:$toto
			}
		}
		`;
		expect(() => compileScript(script)).toThrowError(/Variable \"toto\" is not an array of traits/);
	});

	it("should allow only an array of traits as variable", () => {
		const script = `
		display "intro" {
			layout {

				$fadein = trait FadeTrait("in", #00000000)
				$mousX =  trait MouseXTrait()
				$count =  0

				$toto= [0]

				text "" at:298,104 color:#FFFFFF traits:$toto
			}
		}
		`;
		expect(() => compileScript(script)).toThrowError(/This \"0\" is not a variable/);
	});
});
