export class BBox {
	private _left: number;
	private _top: number;
	private _width: number;
	private _height: number;
	private _previous!: { left: number; top: number; width: number; height: number };

	static create(bbox: { left: number; top: number; width: number; height: number }): BBox {
		return new BBox(bbox.left, bbox.top, bbox.width, bbox.height);
	}

	static createSmallest(): BBox {
		return new BBox(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);
	}

	static copy(srcBbox: BBox, dx?: number, dy?: number): BBox {
		const bbox = new BBox(srcBbox.left, srcBbox.top, srcBbox.width, srcBbox.height);
		if (dx !== undefined) bbox.inflate(dx, dy);
		return bbox;
	}

	constructor(left: number, top: number, width: number, height: number) {
		this._left = left;
		this._top = top;
		this._width = width;
		this._height = height;
		this.save();
	}

	get previous() {
		return { ...this._previous };
	}

	get width(): number {
		return this._width;
	}

	get height(): number {
		return this._height;
	}

	get left(): number {
		return this._left;
	}

	get top(): number {
		return this._top;
	}

	get right(): number {
		return this._left + this._width;
	}

	get bottom(): number {
		return this._top + this._height;
	}

	setSize(size: { width: number; height: number }): void;
	setSize(width: number, height: number): void;
	setSize(widthOrSize: number | { width: number; height: number }, height?: number): void {
		this.save();
		if (typeof widthOrSize === "object") {
			this._width = widthOrSize.width;
			this._height = widthOrSize.height;
		} else {
			this._width = widthOrSize;
			this._height = Number(height);
		}
	}

	setPosition(left: number, top: number): void {
		this.save();
		this._left = left;
		this._top = top;
	}

	set bottom(value: number) {
		this.save();
		this._top = value - this.height;
	}

	set top(value: number) {
		this.save();
		this._top = value;
	}

	set left(value: number) {
		this.save();
		this._left = value;
	}

	set right(value: number) {
		this.save();
		this._left = value - this.width;
	}

	set width(value: number) {
		this.save();
		this._width = value;
	}

	set height(value: number) {
		this.save();
		this._height = value;
	}

	inflate(dx: number, dy?: number) {
		this.save();
		this._left -= dx;
		this._top -= dy ?? dx;
		this._width += dx * 2;
		this._height += (dy ?? dx) * 2;
		return this;
	}

	isPointInside(x: number, y: number): boolean {
		return x >= this._left && x <= this.right && y >= this._top && y <= this.bottom;
	}

	contains(bbox: BBox): boolean {
		return bbox.left >= this._left && bbox.right <= this.right && bbox.top >= this._top && bbox.bottom <= this.bottom;
	}

	intersects(bbox: BBox): boolean {
		return !(bbox.left > this.right || bbox.right < this._left || bbox.top > this.bottom || bbox.bottom < this._top);
	}

	mergeWith(bbox: BBox): void {
		this.save();
		this._left = Math.min(this._left, bbox.left);
		this._top = Math.min(this._top, bbox.top);
		this._width = Math.max(this.right, bbox.right) - this._left;
		this._height = Math.max(this.bottom, bbox.bottom) - this._top;
	}

	clampTo(bbox: BBox): void {
		this.save();
		if (bbox.left > this._left) this._left = bbox.left;
		if (bbox.top > this._top) this._top = bbox.top;
		if (bbox.right < this.right) this.width = bbox.right - this._left;
		if (bbox.bottom < this.bottom) this.height = bbox.bottom - this._top;
	}

	private save() {
		this._previous = {
			left: this._left,
			top: this._top,
			width: this._width,
			height: this._height,
		};
	}
}
