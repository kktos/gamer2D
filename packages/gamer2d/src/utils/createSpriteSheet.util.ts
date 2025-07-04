import { SpriteSheet } from "../game/Spritesheet";
import type { TSpriteDef, TSpriteDefTiles, TSpriteSheet, TSpriteSheetGrid } from "../script/compiler2/rules/ressources/spritesheet.rule";

export function createSpriteSheet(sheet: TSpriteSheet, img: HTMLImageElement | HTMLCanvasElement) {
	const s = new SpriteSheet(sheet.name, img);
	addDefsToSpriteSheet(sheet, s);
	return s;
}

// this function to allow the editor to add definitions to the sprite sheet
export function addDefsToSpriteSheet(sheet: Partial<TSpriteSheet>, s: SpriteSheet) {
	let grid: TSpriteSheetGrid;

	let nameSuffix = 0;

	const processRects = (name: string, rects: number[][] | number[], scale = 1) => {
		if (typeof rects[0] === "number") {
			const [x, y, width, height] = rects as number[];
			s.define(name, { x, y, width, height }, { gridSize: grid.size, scale });
			return;
		}
		(rects as number[][]).forEach(([x, y, width, height], idx) => {
			s.define(`${name}-${nameSuffix + idx}`, { x, y, width, height }, { gridSize: grid.size, scale });
		});
		nameSuffix += rects.length;
	};

	const processTiles = (name: string, tiles: TSpriteDefTiles, scale = 1) => {
		const [width, height] = grid.size;
		const [offsetX, offsetY] = grid.gap ?? [0, 0];

		const [x, y] = [tiles.at.x, tiles.at.y];
		const baseName = name;

		let [dx, dy] = grid.inc ?? [0, 0];
		dx *= width + offsetX;
		dy *= height + offsetY;

		for (let idx = 0; idx < tiles.count; idx++) s.define(`${baseName}-${nameSuffix + idx}`, { x: x + idx * dx, y: y + idx * dy, width, height }, { scale });
		nameSuffix += tiles.count;
	};

	type TDefs = TSpriteDef | TSpriteSheetGrid; // | TRepeat;
	const processSpriteDefinition = (spriteDef: TDefs) => {
		if ("size" in spriteDef) {
			grid = spriteDef;
			return;
		}

		// if ("type" in spriteDef) {
		// 	processSpriteLoop(spriteDef);
		// 	return;
		// }

		nameSuffix = 0;
		for (const def of spriteDef.def) {
			if (Array.isArray(def)) processRects(spriteDef.name, def, spriteDef.scale);
			else processTiles(spriteDef.name, def, spriteDef.scale);
		}
	};
	/*
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
*/
	if (sheet.sprites) for (const spriteDef of sheet.sprites) processSpriteDefinition(spriteDef);
	if (sheet.animations) for (const [name, animDef] of Object.entries(sheet.animations)) s.defineAnim(name, animDef);
}
