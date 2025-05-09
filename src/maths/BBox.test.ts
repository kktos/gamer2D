import { beforeEach, describe, expect, it } from "vitest";
import { BBox } from "./BBox.class";

describe("BBox", () => {
	let bbox: BBox;

	beforeEach(() => {
		bbox = new BBox(10, 20, 30, 40);
	});

	it("should create a BBox instance using constructor", () => {
		expect(bbox).toBeInstanceOf(BBox);
		expect(bbox.left).toBe(10);
		expect(bbox.top).toBe(20);
		expect(bbox.width).toBe(30);
		expect(bbox.height).toBe(40);
	});

	it("should create a BBox instance using static create method", () => {
		const createdBBox = BBox.create({ left: 5, top: 15, width: 25, height: 35 });
		expect(createdBBox).toBeInstanceOf(BBox);
		expect(createdBBox.left).toBe(5);
		expect(createdBBox.top).toBe(15);
		expect(createdBBox.width).toBe(25);
		expect(createdBBox.height).toBe(35);
	});

	it("should correctly calculate right and bottom", () => {
		expect(bbox.right).toBe(10 + 30); // left + width
		expect(bbox.bottom).toBe(20 + 40); // top + height
	});

	it("should store previous state upon creation", () => {
		const prev = bbox.previous;
		expect(prev.left).toBe(10);
		expect(prev.top).toBe(20);
		expect(prev.width).toBe(30);
		expect(prev.height).toBe(40);
	});

	describe("setSize", () => {
		it("should set size using width and height arguments", () => {
			const prev = { ...bbox.previous };
			bbox.setSize(50, 60);
			expect(bbox.width).toBe(50);
			expect(bbox.height).toBe(60);
			expect(bbox.previous.width).toBe(prev.width);
			expect(bbox.previous.height).toBe(prev.height);
		});

		it("should set size using a size object", () => {
			const prev = { ...bbox.previous };
			bbox.setSize({ width: 55, height: 65 });
			expect(bbox.width).toBe(55);
			expect(bbox.height).toBe(65);
			expect(bbox.previous.width).toBe(prev.width);
			expect(bbox.previous.height).toBe(prev.height);
		});
	});

	describe("setPosition", () => {
		it("should set position using left and top arguments", () => {
			const prev = { ...bbox.previous };
			bbox.setPosition(15, 25);
			expect(bbox.left).toBe(15);
			expect(bbox.top).toBe(25);
			expect(bbox.previous.left).toBe(prev.left);
			expect(bbox.previous.top).toBe(prev.top);
		});
	});

	describe("setters", () => {
		it("should set top and update previous", () => {
			const prevTop = bbox.top;
			bbox.top = 25;
			expect(bbox.top).toBe(25);
			expect(bbox.previous.top).toBe(prevTop);
		});

		it("should set left and update previous", () => {
			const prevLeft = bbox.left;
			bbox.left = 15;
			expect(bbox.left).toBe(15);
			expect(bbox.previous.left).toBe(prevLeft);
		});

		it("should set bottom and adjust top, update previous", () => {
			const prevTop = bbox.top;
			const originalHeight = bbox.height;
			bbox.bottom = 70; // 20 + 40 = 60 initially. New bottom 70. top = 70 - 40 = 30
			expect(bbox.bottom).toBe(70);
			expect(bbox.top).toBe(70 - originalHeight);
			expect(bbox.previous.top).toBe(prevTop);
		});

		it("should set right and adjust left, update previous", () => {
			const prevLeft = bbox.left;
			const originalWidth = bbox.width;
			bbox.right = 50; // 10 + 30 = 40 initially. New right 50. left = 50 - 30 = 20
			expect(bbox.right).toBe(50);
			expect(bbox.left).toBe(50 - originalWidth);
			expect(bbox.previous.left).toBe(prevLeft);
		});

		it("should set width and update previous", () => {
			const prevWidth = bbox.width;
			bbox.width = 35;
			expect(bbox.width).toBe(35);
			expect(bbox.previous.width).toBe(prevWidth);
		});

		it("should set height and update previous", () => {
			const prevHeight = bbox.height;
			bbox.height = 45;
			expect(bbox.height).toBe(45);
			expect(bbox.previous.height).toBe(prevHeight);
		});
	});

	describe("contains", () => {
		it("should return true if bbox fully contains another bbox", () => {
			const innerBBox = new BBox(15, 25, 10, 10); // Fully inside 10,20,30,40
			expect(bbox.contains(innerBBox)).toBe(true);
		});

		it("should return true if bbox contains another bbox with shared edges", () => {
			const innerBBox = new BBox(10, 20, 30, 40); // Same as bbox
			expect(bbox.contains(innerBBox)).toBe(true);
		});

		it("should return false if bbox does not contain another bbox (partial overlap)", () => {
			const overlappingBBox = new BBox(5, 15, 20, 20); // Overlaps but not contained
			expect(bbox.contains(overlappingBBox)).toBe(false);
		});

		it("should return false if bbox does not contain another bbox (no overlap)", () => {
			const separateBBox = new BBox(100, 100, 10, 10);
			expect(bbox.contains(separateBBox)).toBe(false);
		});
	});

	describe("intersects", () => {
		it("should return true if bboxes intersect", () => {
			const intersectingBBox = new BBox(25, 35, 30, 30); // bbox is 10,20,30,40
			expect(bbox.intersects(intersectingBBox)).toBe(true);
		});

		it("should return true if one bbox contains another (intersection)", () => {
			const innerBBox = new BBox(15, 25, 10, 10);
			expect(bbox.intersects(innerBBox)).toBe(true);
		});

		it("should return true for shared edges (touching)", () => {
			const touchingBBox = new BBox(40, 20, 10, 10); // Touches right edge of bbox
			expect(bbox.intersects(touchingBBox)).toBe(true);
		});

		it("should return false if bboxes do not intersect", () => {
			const separateBBox = new BBox(100, 100, 10, 10);
			expect(bbox.intersects(separateBBox)).toBe(false);
		});
	});

	describe("mergeWith", () => {
		it("should merge with another intersecting bbox", () => {
			// bbox is 10,20,30,40 (ends at 40,60)
			const otherBBox = new BBox(30, 50, 30, 30); // ends at 60,80
			bbox.mergeWith(otherBBox);
			expect(bbox.left).toBe(10);
			expect(bbox.top).toBe(20);
			expect(bbox.right).toBe(60); // max(40, 60)
			expect(bbox.bottom).toBe(80); // max(60, 80)
			expect(bbox.width).toBe(50); // 60 - 10
			expect(bbox.height).toBe(60); // 80 - 20
		});

		it("should merge with a non-intersecting bbox", () => {
			// bbox is 10,20,30,40 (ends at 40,60)
			const otherBBox = new BBox(100, 100, 10, 10); // ends at 110,110
			bbox.mergeWith(otherBBox);
			expect(bbox.left).toBe(10);
			expect(bbox.top).toBe(20);
			expect(bbox.right).toBe(110);
			expect(bbox.bottom).toBe(110);
			expect(bbox.width).toBe(100); // 110 - 10
			expect(bbox.height).toBe(90); // 110 - 20
		});

		it("should merge when other bbox contains original", () => {
			const containerBBox = new BBox(0, 0, 100, 100);
			bbox.mergeWith(containerBBox); // bbox (10,20,30,40) is inside containerBBox
			expect(bbox.left).toBe(0);
			expect(bbox.top).toBe(0);
			expect(bbox.width).toBe(100);
			expect(bbox.height).toBe(100);
		});

		it("should merge when other bbox is infinitely small", () => {
			const containerBBox = BBox.createSmallest();
			bbox.mergeWith(containerBBox);
			expect(bbox.left).toBe(10);
			expect(bbox.top).toBe(20);
			expect(bbox.width).toBe(30);
			expect(bbox.height).toBe(40);
		});
	});

	describe("clampTo", () => {
		// bbox is 10,20,30,40
		it("should not change if bbox is already within clamp area", () => {
			const clampArea = new BBox(0, 0, 100, 100);
			bbox.clampTo(clampArea);
			expect(bbox.left).toBe(10);
			expect(bbox.top).toBe(20);
			expect(bbox.width).toBe(30);
			expect(bbox.height).toBe(40);
		});

		it("should clamp left edge", () => {
			const clampArea = new BBox(15, 0, 100, 100);
			bbox.clampTo(clampArea); // bbox.left is 10, should become 15
			expect(bbox.left).toBe(15);
			expect(bbox.width).toBe(30); // Width should remain, right edge will shift
		});

		it("should clamp top edge", () => {
			const clampArea = new BBox(0, 25, 100, 100);
			bbox.clampTo(clampArea); // bbox.top is 20, should become 25
			expect(bbox.top).toBe(25);
			expect(bbox.height).toBe(40); // Height should remain, bottom edge will shift
		});

		it("should clamp right edge (by reducing width)", () => {
			// bbox is 10,20,30,40 -> right is 40
			const clampArea = new BBox(0, 0, 35, 100); // clampArea.right is 35
			bbox.clampTo(clampArea);
			expect(bbox.left).toBe(10);
			expect(bbox.right).toBe(35);
			expect(bbox.width).toBe(25); // 35 - 10
		});

		it("should clamp bottom edge (by reducing height)", () => {
			// bbox is 10,20,30,40 -> bottom is 60
			const clampArea = new BBox(0, 0, 100, 50); // clampArea.bottom is 50
			bbox.clampTo(clampArea);
			expect(bbox.top).toBe(20);
			expect(bbox.bottom).toBe(50);
			expect(bbox.height).toBe(30); // 50 - 20
		});

		it("should clamp all sides if bbox is larger than clamp area", () => {
			const clampArea = new BBox(15, 25, 10, 10); // clampArea: 15,25 -> 25,35
			// bbox is 10,20,30,40 -> 10,20 -> 40,60
			bbox.clampTo(clampArea);
			expect(bbox.left).toBe(15);
			expect(bbox.top).toBe(25);
			expect(bbox.right).toBe(25);
			expect(bbox.bottom).toBe(35);
			expect(bbox.width).toBe(10);
			expect(bbox.height).toBe(10);
		});
	});
});
