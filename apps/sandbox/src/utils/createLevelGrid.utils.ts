import { Grid, GridCell } from "gamer2d/utils/maths/grid.math";
import { BoundsGridCell } from "./cells/bounds.cell.js";
import { FloorGridCell } from "./cells/floor.cell.js";

const CELL_KINDS = "-#";

export function createLevelGrid(LEVEL_GRID: Record<string, number>, map) {
	const grid = new Grid(LEVEL_GRID.X, LEVEL_GRID.Y, LEVEL_GRID.CELL_WIDTH, LEVEL_GRID.CELL_HEIGHT);

	for (let indexY = 0; indexY < map.length; indexY++) {
		const row = map[indexY];
		let left = LEVEL_GRID.X;
		for (let indexX = 0; indexX < row.length; indexX++) {
			const kind = row[indexX];
			if (CELL_KINDS.includes(kind)) {
				const top = LEVEL_GRID.Y + indexY * LEVEL_GRID.CELL_HEIGHT;
				const data = {
					kind,
					left,
					top,
					right: left + LEVEL_GRID.CELL_WIDTH,
					bottom: top + LEVEL_GRID.CELL_HEIGHT,
					indexX,
					indexY,
				};
				// const cell = "-_".includes(kind) ? new FloorGridCell(data) : new BoundsGridCell(data);
				let cell: GridCell;
				if (indexY === 0) {
					cell = new GridCell(data);
				} else
					switch (kind) {
						case "-":
							// case "_":
							cell = new FloorGridCell(data);
							break;
						default:
							cell = new BoundsGridCell(data);
							break;
					}

				grid.set(indexX, indexY, cell);
			}
			left += LEVEL_GRID.CELL_WIDTH;
		}
	}
	return grid;
}
