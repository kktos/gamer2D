import { SpriteSheet } from "../game/Spritesheet";
import type { TSpritesSheet } from "../types/engine.types";

export default function createSpriteSheet(sheet: TSpritesSheet, img: HTMLImageElement) {
	const s = new SpriteSheet(img);

	let nameSuffix = 0;

	const processRect = (name: string, rect, scale: number) => {
		const [x, y, w, h] = rect;
		s.define(name, x, y, w, h, { scale });
	};

	const processRects = (name: string, rects, scale: number) => {
		rects.forEach(([x, y, w, h], idx) => {
			s.define(`${name}-${nameSuffix + idx}`, x, y, w, h, { scale });
		});
		nameSuffix += rects.length;
	};

	const processTiles = (name: string, tiles, scale: number) => {
		const [x, y] = tiles.pos;
		const [w, h] = tiles.size;
		let [dx, dy] = tiles.increment;
		const [offsetX, offsetY] = tiles.offset ?? [0, 0];
		dx *= w + offsetX;
		dy *= h + offsetY;
		for (let idx = 0; idx < tiles.count; idx++) {
			// s.define(`${name}-${nameSuffix + idx}`, x + idx * dx, y + idx * dy, w * scale, h * scale, { scale });
			s.define(`${name}-${nameSuffix + idx}`, x + idx * dx, y + idx * dy, w, h, { scale });
		}
		nameSuffix += tiles.count;
	};

	const processGroups = (name: string, groups, scale: number) => {
		for (let idx = 0; idx < groups.length; idx++) {
			processSpriteDefinition(name, groups[idx], scale);
		}
	};

	const processSpriteDefinition = (name: string, def, scale: number) => {
		if (def.rects) {
			processRects(name, def.rects, scale);
			return;
		}

		if (def.rect) {
			processRect(name, def.rect, scale);
			return;
		}

		if (def.sprites) {
			s.defineComplex(name, def.sprites);
			return;
		}

		if (def.tiles) {
			processTiles(name, def.tiles, scale);
			return;
		}

		if (def.groups) {
			processGroups(name, def.groups, scale);
			return;
		}
		throw new TypeError(`Unknown sprite type ${name}`);
	};

	for (const [key, value] of Object.entries(sheet.sprites)) {
		nameSuffix = 0;
		processSpriteDefinition(key, value, value.scale);
	}

	if (sheet.animations)
		for (const [name, animDef] of Object.entries(sheet.animations)) {
			s.defineAnim(name, animDef);
		}
	// Object.entries(sheet.animations).forEach(([name, animDef]) => {
	// 	s.defineAnim(name, animDef);
	// });

	return s;
}
