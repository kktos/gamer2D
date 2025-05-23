import type { TRepeat } from "../layers/display/layout/repeat.rules";
import { tokens } from "../lexer";

export type TSpriteDef = {
	name: string;
	def: unknown[];
	scale?: number;
};
export type TSpriteSheetGrid = {
	size: [number, number];
	inc?: [number, number];
	gap?: [number, number];
};
export type TAnimation = {
	frames: string[] | { range: [number, number]; sprite: string };
	length?: number;
	loop?: number;
};
export type TSpriteSheet = {
	name: string;
	image: string;
	sprites: (TSpriteDef | TSpriteSheetGrid)[];
	animations?: Record<string, TAnimation>;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class SpriteSheetRules {
	static spriteSheet($) {
		return $.RULE("spriteSheet", () => {
			const name = $.SUBRULE($.spriteSheetTypeAndName);
			const sheet: TSpriteSheet = { name, image: "", sprites: [] };

			$.CONSUME(tokens.OpenCurly);

			$.CONSUME(tokens.Image);
			sheet.image = $.CONSUME(tokens.StringLiteral).payload;
			$.ACTION(() => {
				sheet.image = sheet.image.trim();
				if (sheet.image === "") throw new SyntaxError("Missing Image name.");
			});

			$.AT_LEAST_ONE(() => {
				$.OR([
					{
						ALT: () => {
							sheet.sprites = $.SUBRULE($.spriteSheetSprites);
						},
					},
					{
						ALT: () => {
							sheet.animations = $.SUBRULE($.spriteSheetAnims);
						},
					},
				]);
			});

			$.CONSUME(tokens.CloseCurly);

			return sheet;
		});
	}

	static spriteSheetTypeAndName($) {
		return $.RULE("spriteSheetTypeAndName", () => {
			$.CONSUME(tokens.Spritesheet);
			let name = $.CONSUME(tokens.StringLiteral).payload;
			$.ACTION(() => {
				name = name.trim();
				if (name === "") throw new SyntaxError("Missing SpriteSheet name.");
			});
			return name;
		});
	}

	static spriteSheetSprites($) {
		return $.RULE("spriteSheetSprites", () => {
			const sprites: TSpriteSheet["sprites"] = [];

			$.CONSUME(tokens.Sprites);
			$.CONSUME(tokens.OpenCurly);

			let hasGrid = false;
			let hasSprite = false;
			$.AT_LEAST_ONE(() => {
				sprites.push(
					$.OR([
						{
							ALT: () => {
								hasGrid = true;
								return $.SUBRULE($.spriteSheetGrid);
							},
						},
						{
							ALT: () => {
								hasSprite = true;
								return $.SUBRULE($.spriteSheetSprite);
							},
						},
						{
							ALT: () => $.SUBRULE($.spriteSheetFor),
						},
					]),
				);
			});

			$.ACTION(() => {
				if (!hasGrid) throw new SyntaxError("At least one grid is required.");
				if (!hasSprite) throw new SyntaxError("At least one sprite is required.");
			});
			$.CONSUME(tokens.CloseCurly);
			return sprites;
		});
	}

	static spriteSheetFor($) {
		return $.RULE("spriteSheetFor", () => {
			const sprites: TRepeat["items"] = [];
			const result: TRepeat = $.SUBRULE($.layoutForClause);
			$.CONSUME(tokens.OpenCurly);
			$.AT_LEAST_ONE(() => {
				sprites.push($.SUBRULE($.spriteSheetSprite));
			});
			$.CONSUME(tokens.CloseCurly);
			$.ACTION(() => {
				result.items = sprites;
			});
			return result;
		});
	}

	static spriteSheetSprite($) {
		return $.RULE("spriteSheetSprite", () => {
			const name = $.SUBRULE($.spriteSheetSpriteName, { ARGS: [{ isSprite: true }] });

			const sprite: TSpriteDef = {
				name,
				def: [],
			};

			$.OPTION(() => {
				$.CONSUME(tokens.Scale);
				$.CONSUME(tokens.Colon);
				sprite.scale = $.SUBRULE($.number);
			});

			$.CONSUME(tokens.OpenCurly);
			$.AT_LEAST_ONE(() => {
				$.OR2([
					{
						ALT: () => sprite.def.push($.SUBRULE($.spriteSheetSpriteTiles)),
					},
					{
						ALT: () => sprite.def.push($.SUBRULE($.spriteSheetSpriteRects)),
					},
					{
						ALT: () => sprite.def.push($.SUBRULE($.spriteSheetSpriteRect)),
					},
				]);
			});
			$.CONSUME(tokens.CloseCurly);
			return sprite;
		});
	}

	static spriteSheetSpriteName($) {
		return $.RULE("spriteSheetSpriteName", (options) => {
			let name = $.OR([
				{
					ALT: () => $.CONSUME(tokens.StringLiteral).payload,
				},
				{
					ALT: () => $.CONSUME(tokens.Identifier).image,
				},
			]);
			$.ACTION(() => {
				name = name.trim();
				if (name === "") throw new SyntaxError(`Missing ${options?.isSprite ? "Sprite" : "Animation"} name.`);
			});
			return name;
		});
	}

	static spriteSheetSpriteTiles($) {
		return $.RULE("spriteSheetSpriteTiles", () => {
			$.CONSUME(tokens.Tiles);
			const tiles = { pos: $.SUBRULE($.parm_at), count: $.SUBRULE($.parm_count) };
			return tiles;
		});
	}

	static spriteSheetSpriteRects($) {
		return $.RULE("spriteSheetSpriteRects", () => {
			const rects: unknown[] = [];
			$.CONSUME(tokens.Rects);
			$.CONSUME(tokens.OpenCurly);
			$.AT_LEAST_ONE(() => rects.push($.SUBRULE($.rectExpr)));
			$.CONSUME(tokens.CloseCurly);
			return rects;
		});
	}

	static spriteSheetSpriteRect($) {
		return $.RULE("spriteSheetSpriteRect", () => {
			$.CONSUME(tokens.Rect);
			return $.SUBRULE($.rectExpr);
		});
	}

	static spriteSheetAnims($) {
		return $.RULE("spriteSheetAnims", () => {
			const anims: TSpriteSheet["animations"] = {};
			$.CONSUME(tokens.Animations);
			$.CONSUME(tokens.OpenCurly);
			$.AT_LEAST_ONE(() => {
				const { name, anim } = $.SUBRULE($.spriteSheetAnim);
				anims[name] = anim;
			});
			$.CONSUME(tokens.CloseCurly);

			return anims;
		});
	}
	static spriteSheetAnim($) {
		return $.RULE("spriteSheetAnim", () => {
			const anim: TAnimation = { frames: [] };

			const name = $.SUBRULE($.spriteSheetSpriteName, { ARGS: [{ isSprite: false }] });
			$.CONSUME(tokens.OpenCurly);

			$.MANY(() => {
				$.OR([
					{
						ALT: () => {
							$.CONSUME(tokens.Loop);
							anim.loop = $.SUBRULE($.number);
						},
					},
					{
						ALT: () => {
							$.CONSUME(tokens.Length);
							anim.length = $.SUBRULE2($.number);
						},
					},
				]);
			});

			$.CONSUME(tokens.Frames);

			anim.frames = $.OR2([
				{
					ALT: () => {
						const names: string[] = [];
						$.CONSUME(tokens.OpenBracket);
						$.AT_LEAST_ONE_SEP({
							SEP: tokens.Dot,
							DEF: () => {
								names.push($.SUBRULE3($.spriteSheetSpriteName, { ARGS: [{ isSprite: true }] }));
							},
						});
						$.CONSUME(tokens.CloseBracket);
						return names;
					},
				},
				{
					ALT: () => {
						$.OPTION(() => {
							const from = $.CONSUME(tokens.Identifier).image;
							$.ACTION(() => {
								if (from !== "from") throw new SyntaxError("Expecting 'from' keyword.");
							});
						});
						return {
							sprite: $.SUBRULE2($.spriteSheetSpriteName, { ARGS: [{ isSprite: false }] }),
							range: $.SUBRULE($.parm_range),
						};
					},
				},
			]);

			$.CONSUME(tokens.CloseCurly);
			return { name, anim };
		});
	}

	static spriteSheetGrid($) {
		return $.RULE("spriteSheetGrid", () => {
			$.CONSUME(tokens.Grid);
			const grid: TSpriteSheetGrid = { inc: [1, 0], gap: [0, 0], size: $.SUBRULE($.tupleExpr) };
			$.OPTION(() => {
				$.MANY(() => {
					$.OR([
						{
							ALT: () => {
								$.CONSUME(tokens.Inc);
								$.CONSUME(tokens.Colon);
								grid.inc = $.SUBRULE2($.tupleExpr);
							},
						},
						{
							ALT: () => {
								$.CONSUME(tokens.Gap);
								$.CONSUME2(tokens.Colon);
								grid.gap = $.SUBRULE3($.tupleExpr);
							},
						},
					]);
				});
			});

			return grid;
		});
	}
}
