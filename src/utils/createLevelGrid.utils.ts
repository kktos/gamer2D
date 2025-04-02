import ENV from "../env";
import { Grid } from "../maths/grid.math";

const CELL_KINDS = "[]*-_";

export function createLevelGrid(settings) {
	const grid = new Grid(ENV.LEVEL_GRID.X, ENV.LEVEL_GRID.Y, ENV.LEVEL_GRID.CELL_WIDTH, ENV.LEVEL_GRID.CELL_HEIGHT);

	for (let rowIdx = 0; rowIdx < settings.template.length; rowIdx++) {
		const row = settings.template[rowIdx];
		let xPos = ENV.LEVEL_GRID.X;
		for (let colIdx = 0; colIdx < row.length; colIdx++) {
			const cellKind = row[colIdx];
			if (CELL_KINDS.includes(cellKind)) {
				const yPos = ENV.LEVEL_GRID.Y + rowIdx * ENV.LEVEL_GRID.CELL_HEIGHT;
				const cell = {
					kind: cellKind,
					r: {
						x: xPos,
						y: yPos,
						w: ENV.LEVEL_GRID.CELL_WIDTH,
						h: ENV.LEVEL_GRID.CELL_HEIGHT,
					},
				};
				grid.set(colIdx, rowIdx, cell);
			}
			xPos += ENV.LEVEL_GRID.CELL_WIDTH;
		}
	}
	return grid;
}
