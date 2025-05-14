import { describe, expect, it } from "vitest";
import { compileScript } from "../../../compiler";

describe("Layout", () => {
	it("should compile a simple layout script", () => {
		const script = `
		display "intro" {
			display {
				layout {
					$menuItems = [
						"play",
						"intro"
					]

					menu {
						selection {
							color yellow
							background #faee005e
							left "test"
						}
						items {
							repeat $idx count:$menuItems.length {				
								text $menuItems.$idx at:300,200 action:{ goto("") }
							}		
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
	});
});
