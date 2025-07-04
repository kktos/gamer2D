import type { NeatParser } from "../../parser";

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
export type TSpriteDef = {
	name: string;
	def: (TSpriteDefTiles | TSpriteDefRect | TSpriteDefRect[])[];
	scale?: number;
};
export type TSpriteDefTiles = {
	at: { x: number; y: number };
	count: number;
};
type TSpriteDefRect = [number, number, number, number];

export function parseSpritesheet(parser: NeatParser) {
	parser.identifier("spritesheet");

	const result: Partial<TSpriteSheet> = { name: parser.name(), sprites: [] };

	parser.punct("{");

	loop: while (parser.is("IDENTIFIER")) {
		switch (parser.peek().value) {
			case "sprites":
				result.sprites = parseSprites(parser);
				break;
			case "animations":
				result.animations = parseAnimations(parser);
				break;
			case "image":
				parser.advance();
				result.image = parser.string();
				break;
			default:
				break loop;
		}
	}

	if (!result.image) throw new SyntaxError(`Missing image property for spritesheet ${result.name}`);

	parser.punct("}");

	return result as TSpriteSheet;
}

function parseSprites(parser: NeatParser) {
	const sprites: TSpriteSheet["sprites"] = [];

	parser.identifier("sprites");
	parser.punct("{");
	while (!parser.is("PUNCT", "}")) sprites.push(parser.isIdentifier("grid") ? parseGrid(parser) : parseSprite(parser));
	parser.punct("}");

	return sprites;
}

function parseSprite(parser: NeatParser) {
	const result: TSpriteDef = { name: parser.name(), def: [] };

	if (parser.isIdentifier("scale")) {
		parser.advance();
		result.scale = parser.number();
	}

	parser.punct("{");
	while (!parser.is("PUNCT", "}")) {
		switch (parser.identifier()) {
			case "rect":
				result.def.push(parseRect(parser));
				break;
			case "tiles":
				result.def.push(parseTiles(parser));
				break;

			case "rects":
				result.def.push(parseRects(parser));
				break;
		}
	}
	parser.punct("}");

	return result;
}

function parseTiles(parser: NeatParser) {
	const result: TSpriteDefTiles = { at: { x: 0, y: 0 }, count: 1 };

	parser.identifier("at");
	result.at.x = parser.number();
	parser.punct(",");
	result.at.y = parser.number();

	parser.identifier("count");
	result.count = parser.number();
	return result;
}

function parseRect(parser: NeatParser) {
	const result: Partial<TSpriteDefRect> = [];
	parser.punct("[");
	result.push(parser.number());
	parser.punct(",");
	result.push(parser.number());
	parser.punct(",");
	result.push(parser.number());
	parser.punct(",");
	result.push(parser.number());
	parser.punct("]");
	return result as TSpriteDefRect;
}

function parseRects(parser: NeatParser) {
	const result: TSpriteDefRect[] = [];
	parser.punct("{");
	while (!parser.is("PUNCT", "}")) result.push(parseRect(parser));
	parser.punct("}");
	return result;
}

function parseGrid(parser: NeatParser) {
	const result: TSpriteSheetGrid = { size: [1, 1], inc: [1, 0], gap: [0, 0] };
	parser.identifier("grid");

	result.size[0] = parser.number();
	parser.consume(["PUNCT", "IDENTIFIER"], [",", "x"]);
	result.size[1] = parser.number();

	if (parser.isIdentifier(["increment", "inc"])) {
		parser.advance();
		const x = parser.number();
		parser.punct(",");
		const y = parser.number();
		result.inc = [x, y];
	}

	if (parser.isIdentifier("gap")) {
		parser.advance();
		const x = parser.number();
		parser.punct(",");
		const y = parser.number();
		result.gap = [x, y];
	}

	return result;
}

function parseAnimations(parser: NeatParser) {
	const animations: TSpriteSheet["animations"] = {};

	parser.identifier("animations");
	parser.punct("{");
	while (!parser.is("PUNCT", "}")) {
		const anim = parseAnimation(parser);
		animations[anim.name] = anim.def;
	}
	parser.punct("}");

	return animations;
}

function parseAnimation(parser: NeatParser) {
	const result: Partial<TAnimation> = {};

	const name = parser.name();
	parser.punct("{");
	while (parser.is("IDENTIFIER")) {
		switch (parser.peek().value) {
			case "frames":
				result.frames = parseAnimationFrames(parser);
				break;
			case "length":
				parser.advance();
				result.length = parser.number();
				break;
			case "loop":
				parser.advance();
				result.loop = parser.number();
				break;
		}
	}
	parser.punct("}");

	return { name, def: result as TAnimation };
}

function parseAnimationFrames(parser: NeatParser) {
	let result: Partial<TAnimation["frames"]>;
	parser.identifier("frames");

	if (parser.is("PUNCT", "[")) {
		result = [];
		parser.punct("[");
		while (!parser.is("PUNCT", ",")) result.push(parser.name());
		parser.punct("]");
	} else {
		const sprite = parser.name();

		parser.identifier("range");
		const from = parser.number();
		parser.punct(",");
		const to = parser.number();

		result = { range: [from, to], sprite };
	}

	return result as TAnimation["frames"];
}
