type ScrollbarState = {
	x: number; // x position of scrollbar
	y: number; // y position of scrollbar
	width: number; // scrollbar width (in px)
	height: number; // scrollbar height (in px)
	min: number; // min scroll value
	max: number; // max scroll value
	value: number; // current scroll value
	page: number; // visible content size (in scroll units)
	dragging: boolean;
	dragOffset: number;
	hover: boolean;
};

export class CanvasHorizontalScrollbar {
	private state: ScrollbarState;
	private onScroll: (value: number) => void;
	private canvas: HTMLCanvasElement;

	static trackColor = "#f1f1f1";
	static thumbColor = "#d4d4d4";
	static thumbHoverColor = "#c1c1c1";
	static thumbDragColor = "#b0b0b0";
	static thumbBorderColor = "#e0e0e0";
	static thumbBorderWidth = 1;
	static thumbRadius = 6;

	constructor(canvas: HTMLCanvasElement, x: number, y: number, width: number, height: number, onScroll: (value: number) => void) {
		this.canvas = canvas;
		this.onScroll = onScroll;
		this.state = {
			x,
			y,
			width,
			height,
			min: 0,
			max: 100,
			value: 0,
			page: 10,
			dragging: false,
			dragOffset: 0,
			hover: false,
		};
		// this.attachEvents();
	}

	setScroll(min: number, max: number, value: number, page: number) {
		this.state.min = min;
		this.state.max = max;
		this.state.value = Math.max(min, Math.min(max - page, value));
		this.state.page = page;
	}

	setThumb(value: number) {
		this.state.value = value * (this.state.max - this.state.page); //Math.max(this.state.min, Math.min(this.state.max - this.state.page, value));
		console.log("Scrollbar value", this.state.value);
	}

	draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
		const { width, height, min, max, value, page, hover, dragging } = this.state;
		// Track
		ctx.save();
		ctx.globalAlpha = 0.7;
		ctx.fillStyle = CanvasHorizontalScrollbar.trackColor;
		ctx.fillRect(x, y, width, height);
		ctx.globalAlpha = 1.0;

		// Thumb
		const range = max - min;
		const thumbW = Math.max(30, (page / range) * width);
		const thumbX = x + ((value - min) / range) * (width - thumbW);

		ctx.fillStyle = dragging
			? CanvasHorizontalScrollbar.thumbDragColor
			: hover
				? CanvasHorizontalScrollbar.thumbHoverColor
				: CanvasHorizontalScrollbar.thumbColor;
		ctx.strokeStyle = CanvasHorizontalScrollbar.thumbBorderColor;
		ctx.lineWidth = CanvasHorizontalScrollbar.thumbBorderWidth;
		ctx.beginPath();
		ctx.roundRect(thumbX, y + 2, thumbW, height - 4, CanvasHorizontalScrollbar.thumbRadius);
		ctx.fill();
		ctx.stroke();

		ctx.restore();
	}

	handleEvent(gc, e): boolean {
		switch (e.type) {
			case "mousemove": {
				return this.onMouseMove(e);
			}
			case "mousedown": {
				return this.onMouseDown(e);
			}
			case "mouseup": {
				return this.onMouseUp(e);
			}
			case "mouseleave": {
				return this.onMouseLeave(e);
			}
		}
		return false;
	}

	// private attachEvents() {
	// 	this.canvas.addEventListener("mousedown", this.onMouseDown);
	// 	this.canvas.addEventListener("mousemove", this.onMouseMove);
	// 	this.canvas.addEventListener("mouseup", this.onMouseUp);
	// 	this.canvas.addEventListener("mouseleave", this.onMouseLeave);
	// }

	private getThumbRect() {
		const { x, y, width, height, min, max, value, page } = this.state;
		const range = max - min;
		const thumbW = Math.max(30, (page / range) * width);
		const thumbX = x + ((value - min) / range) * (width - thumbW);
		return { x: thumbX, y: y + 2, width: thumbW, height: height - 4 };
	}

	private onMouseDown = (e: MouseEvent) => {
		// const rect = this.canvas.getBoundingClientRect();
		// const mx = e.clientX - rect.left;
		// const my = e.clientY - rect.top;
		const thumb = this.getThumbRect();
		const mx = e.x;
		const my = e.y;

		if (mx >= thumb.x && mx <= thumb.x + thumb.width && my >= thumb.y && my <= thumb.y + thumb.height) {
			this.state.dragging = true;
			this.state.dragOffset = mx - thumb.x;
			return true;
		}
		return false;
	};

	private onMouseMove = (e: MouseEvent) => {
		// const rect = this.canvas.getBoundingClientRect();
		// const mx = e.clientX - rect.left;
		// const my = e.clientY - rect.top;
		const thumb = this.getThumbRect();
		const mx = e.x;
		const my = e.y;

		if (this.state.dragging) {
			const { x, width, min, max, page } = this.state;
			const range = max - min;
			const thumbW = thumb.width;
			let newThumbX = mx - this.state.dragOffset;
			newThumbX = Math.max(x, Math.min(x + width - thumbW, newThumbX));
			const newValue = min + ((newThumbX - x) / (width - thumbW)) * (range - page);
			this.state.value = Math.max(min, Math.min(max - page, newValue));
			this.onScroll(this.state.value);
			return true;
		}

		this.state.hover = mx >= thumb.x && mx <= thumb.x + thumb.width && my >= thumb.y && my <= thumb.y + thumb.height;
		return this.state.hover;
	};

	private onMouseUp = (_e: MouseEvent) => {
		this.state.dragging = false;
		return false;
	};

	private onMouseLeave = (_e: MouseEvent) => {
		this.state.dragging = false;
		this.state.hover = false;
		return false;
	};
}
