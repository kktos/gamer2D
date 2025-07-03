export type TGridCellData = {
	kind: string;
	left: number;
	top: number;
	right: number;
	bottom: number;
	indexX: number;
	indexY: number;
};
export class GridCell {
	readonly kind: string;
	readonly left: number;
	readonly top: number;
	readonly right: number;
	readonly bottom: number;
	readonly indexX: number;
	readonly indexY: number;

	constructor({ kind, left, top, right, bottom, indexX, indexY }: TGridCellData) {
		this.kind = kind;
		this.left = left;
		this.top = top;
		this.right = right;
		this.bottom = bottom;
		this.indexX = indexX;
		this.indexY = indexY;
	}
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type GridCellConstructor = new (...args: any[]) => GridCell;

export class Grid {
	private grid: GridCell[][];
	readonly orgX: number;
	readonly orgY: number;
	readonly cellHeight: number;
	readonly cellWidth: number;

	constructor(x: number, y: number, w: number, h: number) {
		this.grid = [];
		this.orgX = x;
		this.orgY = y;
		this.cellHeight = w;
		this.cellWidth = h;
	}

	forEach(callback) {
		this.grid.forEach((column, x) => column.forEach((value, y) => callback(value, x, y)));
	}

	delete(x: number, y: number) {
		const col = this.grid[x];
		if (col) delete col[y];
	}

	clear() {
		this.grid = [];
	}

	get(x: number, y: number) {
		const col = this.grid[x];
		if (col) return col[y];
	}

	set(x: number, y: number, value: GridCell) {
		if (!this.grid[x]) this.grid[x] = [];
		this.grid[x][y] = value;
	}

	toCoord(x: number, y: number) {
		return [this.orgX + x * this.cellWidth, this.orgY + y * this.cellHeight];
	}
	toCoordX(x: number) {
		return this.orgX + x * this.cellWidth;
	}
	toCoordY(y: number) {
		return this.orgY + y * this.cellHeight;
	}

	toGrid(x: number, y: number) {
		return [Math.floor((x - this.orgX) / this.cellWidth), Math.floor((y - this.orgY) / this.cellHeight)];
	}
	toGridX(x: number) {
		return Math.floor((x - this.orgX) / this.cellWidth);
	}
	toGridY(y: number) {
		return Math.floor((y - this.orgY) / this.cellHeight);
	}

	private getByIndex(indexX: number, indexY: number) {
		const tile = this.get(indexX, indexY);
		if (tile) return tile;
		// if (tile) {
		// 	const left = this.orgX + indexX * this.cellWidth;
		// 	const right = this.orgX + (indexX + 1) * this.cellWidth;
		// 	const top = this.orgY + indexY * this.cellWidth;
		// 	const bottom = this.orgY + (indexY + 1) * this.cellWidth;
		// 	return { tile, left, right, top, bottom, indexX, indexY };
		// }
	}

	private toXIndex(pos: number) {
		return Math.floor(pos / this.cellWidth);
	}

	private *toXIndexRange(pos1: number, pos2: number) {
		const pMax = Math.ceil(pos2 / this.cellWidth) * this.cellWidth;
		for (let pos = pos1; pos < pMax; pos += this.cellWidth) yield this.toXIndex(pos);
	}

	private toYIndex(pos: number) {
		return Math.floor(pos / this.cellHeight);
	}

	private *toYIndexRange(pos1: number, pos2: number) {
		const pMax = Math.ceil(pos2 / this.cellHeight) * this.cellHeight;
		for (let pos = pos1; pos < pMax; pos += this.cellHeight) yield this.toYIndex(pos);
	}

	public *searchByRange(x1: number, x2: number, y1: number, y2: number) {
		for (const indexX of this.toXIndexRange(x1 - this.orgX, x2 - this.orgX)) {
			for (const indexY of this.toYIndexRange(y1 - this.orgY, y2 - this.orgY)) {
				const match = this.getByIndex(indexX, indexY);
				if (match) {
					yield match;
				}
			}
		}
	}
}
