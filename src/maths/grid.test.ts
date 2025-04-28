import { beforeEach, describe, expect, it } from "vitest";
import { Grid, GridCell } from "./grid.math";

describe("Grid", () => {
	let grid: Grid;
	const orgX = 20;
	const orgY = 55;
	const cellWidth = 16;
	const cellHeight = 16;

	beforeEach(() => {
		grid = new Grid(orgX, orgY, cellWidth, cellHeight);
	});

	it("should create a grid, set values and get them", () => {
		const cell: GridCell = new GridCell({ kind: "", left: 0, top: 0, right: 0, bottom: 0, indexX: 0, indexY: 0 });
		for (let x = 0; x < 20; x++) {
			grid.set(x, 10, { ...cell, kind: x.toString() });
		}
		expect(grid.get(10, 10)?.kind).toEqual("10");
	});

	describe("set and get", () => {
		it("should set and get a value at a specific grid coordinate", () => {
			const cellValue: GridCell = new GridCell({ kind: "wall", left: 0, top: 0, right: 16, bottom: 8, indexX: 0, indexY: 0 });
			grid.set(2, 3, cellValue);
			expect(grid.get(2, 3)).toBe(cellValue);
		});

		it("should return undefined for coordinates without a value", () => {
			expect(grid.get(0, 0)).toBeUndefined();
		});

		it("should return undefined for coordinates in a non-existent column", () => {
			expect(grid.get(100, 0)).toBeUndefined();
		});

		it("should overwrite existing values", () => {
			const cellValue1: GridCell = new GridCell({ kind: "floor", left: 0, top: 0, right: 16, bottom: 8, indexX: 0, indexY: 0 });
			const cellValue2: GridCell = new GridCell({ kind: "door", left: 0, top: 0, right: 16, bottom: 8, indexX: 0, indexY: 0 });
			grid.set(1, 1, cellValue1);
			expect(grid.get(1, 1)).toBe(cellValue1);
			grid.set(1, 1, cellValue2);
			expect(grid.get(1, 1)).toBe(cellValue2);
		});
	});

	describe("delete", () => {
		it("should delete a value at a specific grid coordinate", () => {
			const cellValue: GridCell = new GridCell({ kind: "wall", left: 0, top: 0, right: 16, bottom: 8, indexX: 0, indexY: 0 });
			grid.set(4, 5, cellValue);
			expect(grid.get(4, 5)).toBe(cellValue);
			grid.delete(4, 5);
			expect(grid.get(4, 5)).toBeUndefined();
		});

		it("should not throw an error when deleting a non-existent value", () => {
			expect(() => grid.delete(0, 0)).not.toThrow();
		});

		it("should not throw an error when deleting from a non-existent column", () => {
			expect(() => grid.delete(100, 0)).not.toThrow();
		});
	});

	describe("toCoord", () => {
		it("should convert grid coordinates to world coordinates", () => {
			expect(grid.toCoord(0, 0)).toEqual([orgX, orgY]);
			expect(grid.toCoord(1, 0)).toEqual([orgX + cellWidth, orgY]);
			expect(grid.toCoord(0, 1)).toEqual([orgX, orgY + cellHeight]);
			expect(grid.toCoord(2, 3)).toEqual([orgX + 2 * cellWidth, orgY + 3 * cellHeight]);
		});
	});

	describe("toGrid", () => {
		it("should convert world coordinates to grid coordinates", () => {
			expect(grid.toGrid(orgX, orgY)).toEqual([0, 0]);
			expect(grid.toGrid(orgX + 5, orgY + 3)).toEqual([0, 0]); // Inside first cell
			expect(grid.toGrid(orgX + cellWidth - 1, orgY + cellHeight - 1)).toEqual([0, 0]); // Edge of first cell
			expect(grid.toGrid(orgX + cellWidth, orgY)).toEqual([1, 0]); // Start of next cell X
			expect(grid.toGrid(orgX, orgY + cellHeight)).toEqual([0, 1]); // Start of next cell Y
			expect(grid.toGrid(orgX + 1.5 * cellWidth, orgY + 2.5 * cellHeight)).toEqual([1, 2]);
			expect(grid.toGrid(orgX - 1, orgY - 1)).toEqual([-1, -1]); // Before origin
		});
	});

	describe("searchByRange", () => {
		beforeEach(() => {
			grid.clear();

			const cell: GridCell = new GridCell({ kind: "", left: 0, top: 0, right: 0, bottom: 0, indexX: 0, indexY: 0 });
			for (let x = 0; x < 20; x++) {
				grid.set(x, 10, { ...cell, kind: x.toString() });
			}
		});

		it("should find cells fully within the range", () => {
			const x = grid.toCoordX(2);
			const y1 = grid.toCoordY(9);
			const y2 = grid.toCoordY(11);

			const results = [...grid.searchByRange(x, x, y1, y2)];

			expect(results).toHaveLength(1);
			expect(results[0]?.indexX).toEqual(2);
			expect(results[0]?.indexY).toEqual(10);
		});
	});
});
