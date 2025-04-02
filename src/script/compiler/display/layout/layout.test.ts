import { describe, expect, it } from "vitest";
import { compileScript } from "../../compiler";

describe("Layout", () => {
	it("should compile a simple layout script", () => {
		const script = `
		display "intro" {
			layout {
				menuItems = [
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
						repeat count:$menuItems.length var:idx step:{ at:0,50 } {				
							item {
								text $menuItems.$idx at:300,200
							}
						}		
					}
				}			
			}
		}
		`;
		const result = compileScript(script);
		expect(result).toBeDefined();
		expect(result).toStrictEqual({
			background: "#FF0000",
			font: "bubble-bobble",
			name: "intro",
			showCursor: true,
			type: "display",
		});
	});
});
