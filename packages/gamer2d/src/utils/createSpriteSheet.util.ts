import type { TSpriteDef, TSpriteSheet, TSpriteSheetGrid } from "gamer2d/script/compiler/ressources/spritesheet.rules";
import { SpriteSheet } from "../game/Spritesheet";
import type { TRepeat } from "../script/compiler/layers/display/layout/repeat.rules";
import { evalValue } from "../script/engine/eval.script";
import { type TVarTypes, TVars } from "./vars.utils";

export function createSpriteSheet(sheet: TSpriteSheet, img: HTMLImageElement | HTMLCanvasElement) {
	let grid: TSpriteSheetGrid;
	const vars = new TVars(new Map<string, TVarTypes>());
	const s = new SpriteSheet(sheet.name, img);

	console.log("createSpriteSheet", sheet);

	let nameSuffix = 0;

	const processRects = (name: string, rects: number[][] | number[], scale = 1) => {
		if (typeof rects[0] === "number") {
			const [x, y, w, h] = rects as number[];
			s.define(name, x, y, w, h, { scale });
			return;
		}

		(rects as number[][]).forEach(([x, y, w, h], idx) => s.define(`${name}-${nameSuffix + idx}`, x, y, w, h, { scale }));
		nameSuffix += rects.length;
	};

	const processTiles = (name: string, tiles, scale = 1) => {
		const [x, y] = [evalValue({ vars }, tiles.pos[0]), evalValue({ vars }, tiles.pos[1])];
		const [w, h] = grid.size;
		let [dx, dy] = grid.inc ?? [0, 0];
		const [offsetX, offsetY] = grid.gap ?? [0, 0];
		dx *= w + offsetX;
		dy *= h + offsetY;
		const baseName = evalValue({ vars }, name);
		for (let idx = 0; idx < tiles.count; idx++) {
			s.define(`${baseName}-${nameSuffix + idx}`, x + idx * dx, y + idx * dy, w, h, { scale });
		}
		nameSuffix += tiles.count;
	};

	type TDefs = TSpriteDef | TSpriteSheetGrid | TRepeat;
	const processSpriteDefinition = (spriteDef: TDefs) => {
		if ("size" in spriteDef) {
			grid = spriteDef;
			return;
		}

		if ("type" in spriteDef) {
			processSpriteLoop(spriteDef);
			return;
		}

		nameSuffix = 0;
		for (const def of spriteDef.def) {
			if (Array.isArray(def)) processRects(spriteDef.name, def, spriteDef.scale);
			else processTiles(spriteDef.name, def, spriteDef.scale);
		}
	};

	const processSpriteLoop = (spriteDef: TRepeat) => {
		if (!spriteDef.list || !Array.isArray(spriteDef.list)) return;

		// evalExpr({ vars });
		let idx = 0;
		for (const value of spriteDef.list) {
			vars.set(spriteDef.var as string, value);
			if (spriteDef.index) vars.set(spriteDef.index as string, idx);
			for (const def of spriteDef.items) {
				processSpriteDefinition(def as unknown as TDefs);
			}
			idx++;
		}
	};

	for (const spriteDef of sheet.sprites) processSpriteDefinition(spriteDef);
	if (sheet.animations) for (const [name, animDef] of Object.entries(sheet.animations)) s.defineAnim(name, animDef);

	return s;
}
