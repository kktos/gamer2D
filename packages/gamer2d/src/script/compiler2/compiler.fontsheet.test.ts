import { describe, expect, it } from "vitest";
import { compile } from "./compiler";
import type { TFontSheet } from "./rules/ressources/font.rule";

describe("compiler - fontsheet", () => {
	it("should compile a minimal fontsheet", () => {
		const script = `
			font "min_font" {
				image "assets/font.png"
				size 16x16
				charset [ "ABC", "DEF" ]
			}
		`;

		const result = compile<TFontSheet>(script, "fontsheet");
		
		expect(result).toMatchObject({
			name: "min_font",
			image: "assets/font.png",
			height: 16,
			width: 16,
			charset: "ABCDEF",
			offsetX: 0,
			offsetY: 0,
			gapX: 0,
			gapY: 0,
			isMulticolor: false
		});
	});

	it("should compile a fully defined fontsheet", () => {
		const script = `
			font "full_font" {
				image "assets/font2.png"
				size 8x12
				offset 2, 4
				gap 1, 1
				multicolor
				charset [ "01234", "56789" ]
			}
		`;

		const result = compile<TFontSheet>(script, "fontsheet");
		
		expect(result).toMatchObject({
			name: "full_font",
			image: "assets/font2.png",
			height: 8,
			width: 12,
			charset: "0123456789",
			offsetX: 2,
			offsetY: 4,
			gapX: 1,
			gapY: 1,
			isMulticolor: true
		});
	});

	it("should throw an error if image is missing", () => {
		const script = `
			font "bad_font" {
				size 16, 16
				charset [ "ABC" ]
			}
		`;
		expect(() => compile<TFontSheet>(script, "fontsheet")).toThrow("Missing mandatory 'charset' or 'image' or 'size' property for fontsheet bad_font");
	});

	it("should throw an error if size is missing", () => {
		const script = `
			font "bad_font" {
				image "font.png"
				charset [ "ABC" ]
			}
		`;
		expect(() => compile<TFontSheet>(script, "fontsheet")).toThrow("Missing mandatory 'charset' or 'image' or 'size' property for fontsheet bad_font");
	});

	it("should throw an error if charset is missing", () => {
		const script = `
			font "bad_font" {
				image "font.png"
				size 16, 16
			}
		`;
		expect(() => compile<TFontSheet>(script, "fontsheet")).toThrow("Missing mandatory 'charset' or 'image' or 'size' property for fontsheet bad_font");
	});
});
