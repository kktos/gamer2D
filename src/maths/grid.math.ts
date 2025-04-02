export class Grid {
	grid: unknown[][];
	baseX: number;
	baseY: number;
	cellHeight: number;
	cellWidth: number;

	constructor(x: number, y: number, w: number, h: number) {
		this.grid = [];
		this.baseX = x;
		this.baseY = y;
		this.cellHeight = w;
		this.cellWidth = h;
	}

	forEach(callback) {
		this.grid.forEach((column, x) => {
			column.forEach((value, y) => {
				callback(value, x, y);
			});
		});
	}

	delete(x: number, y: number) {
		const col = this.grid[x];
		if (col) {
			delete col[y];
		}
	}

	get(x: number, y: number) {
		const col = this.grid[x];
		if (col) {
			return col[y];
		}
		return undefined;
	}

	set(x: number, y: number, value: unknown) {
		if (!this.grid[x]) {
			this.grid[x] = [];
		}

		this.grid[x][y] = value;
	}

	toCoord(x: number, y: number) {
		return { x: this.baseX + x * this.cellWidth, y: this.baseY + y * this.cellHeight };
	}

	toGrid(x: number, y: number) {
		return { x: Math.floor((x - this.baseX) / this.cellWidth), y: Math.floor((y - this.baseY) / this.cellHeight) };
	}
}
