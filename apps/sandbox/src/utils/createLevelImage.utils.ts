import type { Font, Grid, GridCell, ResourceManager, SpriteSheet } from "gamer2d";

type TSettings = {
	big: string;
	small: string;
	colorDark: string;
	colorLight: string;
	fontColor: string;
};

export function createLevelImage(LEVEL_GRID: Record<string, number>, resourceManager: ResourceManager, grid: Grid, settings) {
	const name = 1; //sheet.name;
	const spritesheet = resourceManager.get("sprite", "level-tiles") as SpriteSheet;
	const levelNumber = Number(name);

	const canvas = document.createElement("canvas");
	canvas.width = LEVEL_GRID.CELL_WIDTH * LEVEL_GRID.COL;
	canvas.height = LEVEL_GRID.CELL_HEIGHT * LEVEL_GRID.ROW;

	const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
	ctx.translate(-LEVEL_GRID.X, -LEVEL_GRID.Y);

	grid.forEach((cell: GridCell, x, y) => {
		switch (cell.kind) {
			case "#": {
				const kind = grid.get(x + 1, y)?.kind;
				const isFirstOfTwo = kind === "#";
				if (isFirstOfTwo) {
					spritesheet.draw(`large-${levelNumber}`, ctx, cell.left, cell.top);
					break;
				}
				const kind2 = grid.get(x - 1, y)?.kind;
				const isSecondOfTwo = kind2 === "#";
				if (isSecondOfTwo) {
					ctx.fillStyle = settings.colorDark;
					ctx.fillRect(cell.right, cell.top, 5, cell.bottom - cell.top + 1);
				}
				break;
			}
			case "]":
				spritesheet.draw(`large-${levelNumber}`, ctx, cell.left, cell.top);
				break;

			case "-": {
				spritesheet.draw(`small-${levelNumber}`, ctx, cell.left, cell.top);

				const isFirstOfKind = grid.get(x - 1, y)?.kind !== "-";
				const offsetLeft = isFirstOfKind ? 5 : 0;
				const isLastOFKind = grid.get(x + 1, y)?.kind !== "-";
				const offsetRight = isLastOFKind ? 5 : 0;

				const top = cell.bottom;
				const right = cell.right;

				ctx.beginPath();
				ctx.moveTo(cell.left, top);
				ctx.lineTo(cell.left + offsetLeft, top + 5);
				ctx.lineTo(right + 1 + offsetRight, top + 5);
				ctx.lineTo(right + 1, top);
				ctx.fillStyle = settings.colorLight;
				ctx.fill();

				if (isLastOFKind) {
					const left = right;
					const top = cell.top - 1;
					const bottom = cell.bottom - 1;
					ctx.beginPath();
					ctx.moveTo(left, top);
					ctx.lineTo(left + 5, top + 5);
					ctx.lineTo(left + 5, bottom + 5);
					ctx.lineTo(left, bottom);
					ctx.fillStyle = settings.colorDark;
					ctx.fill();
				}

				break;
			}

			case "_":
				spritesheet.draw(`small-${levelNumber}`, ctx, cell.left, cell.top);
				break;
		}

		// ctx.strokeStyle = "white";
		// ctx.strokeRect(cell.r.x, cell.r.y, 16, 16);
		// ctx.fillStyle = "black";
		// ctx.font = "bold 7px sans-serif";
		// ctx.fillText(`${x}`, cell.r.x + 4, cell.r.y + 6);
		// ctx.fillText(`${y}`, cell.r.x + 4, cell.r.y + 14);
	});

	ctx.translate(LEVEL_GRID.X, LEVEL_GRID.Y);

	// const cellWidth = bigBlockSize.x/2;
	// const cellHeight = bigBlockSize.y/2;
	// ctx.strokeStyle = "white";
	// for (let col = 0; col < ENV.LEVEL_GRID.COL; col++) {
	// 	for (let row = 0; row < ENV.LEVEL_GRID.ROW; row++) {
	// 		ctx.strokeRect(col*cellWidth, row*cellHeight, cellWidth, cellHeight);
	// 	}
	// }

	const font = resourceManager.get("font", "level-numbers") as Font;
	font.size = 2;
	font.print({
		ctx,
		text: String(levelNumber),
		x: 12,
		y: 4,
		color: settings.fontColor,
	});

	return canvas;
}
