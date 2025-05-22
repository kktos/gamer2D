import type { Rect } from "gamer2d/maths/math";

type TMethodCtx = {
	isBackground: (x, y) => boolean;
	canvas: HTMLCanvasElement;
	visited: boolean[];
};
type TMethod = "floodFill" | "improvedFloodFill" | "traceContour";

/**
 * Detects sprites on a canvas based on minimum size and background color.
 *
 * @param {HTMLCanvasElement} canvas - The canvas to analyze
 * @param {Object} options - Configuration options
 * @param {number} options.minWidth - Minimum width for a sprite to be detected
 * @param {number} options.minHeight - Minimum height for a sprite to be detected
 * @param {Array<number>} options.backgroundColor - Background color as [r,g,b,a] that should be treated as transparent
 * @param {number} options.tolerance - Color tolerance for background detection (0-255)
 * @returns {Array<Object>} - Array of detected sprites with their boundaries
 */
export function detectSprites(method: TMethod, canvas, options = {}) {
	const defaultOptions = {
		minWidth: 10,
		minHeight: 10,
		backgroundColor: [0, 0, 0, 0],
		toleranceRGB: 10,
		toleranceAlpha: 0,
	};
	const config = { ...defaultOptions, ...options };

	const ctx = canvas.getContext("2d");
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imageData.data;
	const visited = new Array(canvas.width * canvas.height).fill(false);

	// Function to check if a pixel is a background color
	function isBackground(x, y) {
		if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) {
			return true; // Out of bounds is considered background
		}

		const idx = (y * canvas.width + x) * 4;
		const r = data[idx];
		const g = data[idx + 1];
		const b = data[idx + 2];
		const a = data[idx + 3];

		// Check if color is within tolerance of background color
		return (
			Math.abs(r - config.backgroundColor[0]) <= config.toleranceRGB &&
			Math.abs(g - config.backgroundColor[1]) <= config.toleranceRGB &&
			Math.abs(b - config.backgroundColor[2]) <= config.toleranceRGB &&
			// (config.backgroundColor[3] === 0 || Math.abs(a - config.backgroundColor[3]) <= config.toleranceAlpha)
			Math.abs(a - config.backgroundColor[3]) <= config.toleranceAlpha
		);
	}

	const methodCtx: TMethodCtx = {
		isBackground,
		canvas,
		visited,
	};

	// Find all sprites in the canvas
	const sprites: Rect[] = [];

	for (let y = 0; y < canvas.height; y++) {
		for (let x = 0; x < canvas.width; x++) {
			// Skip if already visited or is background
			if (visited[y * canvas.width + x] || isBackground(x, y)) continue;

			let sprite: Rect;
			switch (method) {
				case "floodFill":
					sprite = floodFill(methodCtx, x, y);
					break;
				case "improvedFloodFill":
					sprite = improvedFloodFill(methodCtx, x, y);
					break;
				case "traceContour":
					sprite = traceContour(methodCtx, x, y);
					break;
				default:
					throw new Error("Unknown method");
			}

			// Only add sprite if it meets the minimum size requirements
			if (sprite.width >= config.minWidth && sprite.height >= config.minHeight) sprites.push(sprite);
		}
	}

	if (canvas.width > canvas.height) sprites.sort((a, b) => a.x - b.x);
	else sprites.sort((a, b) => a.y - b.y);

	return sprites;
}

function floodFill(methodCtx: TMethodCtx, startX, startY) {
	const stack = [{ x: startX, y: startY }];
	let minX = startX;
	let maxX = startX;
	let minY = startY;
	let maxY = startY;

	// Visit the start pixel
	methodCtx.visited[startY * methodCtx.canvas.width + startX] = true;

	while (stack.length > 0) {
		const { x, y } = stack.pop();

		// Update boundaries
		minX = Math.min(minX, x);
		maxX = Math.max(maxX, x);
		minY = Math.min(minY, y);
		maxY = Math.max(maxY, y);

		// Check 4 adjacent pixels (up, right, down, left)
		const directions = [
			{ dx: 0, dy: -1 }, // up
			{ dx: 1, dy: 0 }, // right
			{ dx: 0, dy: 1 }, // down
			{ dx: -1, dy: 0 }, // left
		];

		for (const { dx, dy } of directions) {
			const nx = x + dx;
			const ny = y + dy;
			const idx = ny * methodCtx.canvas.width + nx;

			// If pixel is valid, not background, and not visited
			if (nx >= 0 && nx < methodCtx.canvas.width && ny >= 0 && ny < methodCtx.canvas.height && !methodCtx.isBackground(nx, ny) && !methodCtx.visited[idx]) {
				// Mark as visited and add to stack
				methodCtx.visited[idx] = true;
				stack.push({ x: nx, y: ny });
			}
		}
	}

	// Return the sprite boundaries
	return {
		x: minX,
		y: minY,
		width: maxX - minX + 1,
		height: maxY - minY + 1,
	};
}

function improvedFloodFill(methodCtx: TMethodCtx, startX, startY) {
	let bbox = floodFill(methodCtx, startX, startY);
	let expanded = true;
	while (expanded) {
		expanded = false;
		for (let y = bbox.y; y < bbox.y + bbox.height; y++) {
			for (let x = bbox.x; x < bbox.x + bbox.width; x++) {
				if (!methodCtx.visited[y * methodCtx.canvas.width + x] && !methodCtx.isBackground(x, y)) {
					// Found a "hole" inside the bbox, flood fill it and expand bbox if needed
					const innerBox = floodFill(methodCtx, x, y);
					// Expand bbox to include innerBox if needed
					const minX = Math.min(bbox.x, innerBox.x);
					const minY = Math.min(bbox.y, innerBox.y);
					const maxX = Math.max(bbox.x + bbox.width - 1, innerBox.x + innerBox.width - 1);
					const maxY = Math.max(bbox.y + bbox.height - 1, innerBox.y + innerBox.height - 1);
					bbox = {
						x: minX,
						y: minY,
						width: maxX - minX + 1,
						height: maxY - minY + 1,
					};
					expanded = true;
				}
			}
		}
	}
	return bbox;
}

// Moore-Neighbor tracing for outer contour
function traceContour(methodCtx: TMethodCtx, startX, startY) {
	const dirs = [
		[0, -1],
		[1, -1],
		[1, 0],
		[1, 1],
		[0, 1],
		[-1, 1],
		[-1, 0],
		[-1, -1],
	];
	let x = startX;
	let y = startY;
	const contour = [{ x, y }];
	let dir = 0;
	let found = false;
	let minX = x;
	let maxX = x;
	let minY = y;
	let maxY = y;

	do {
		found = false;
		for (let i = 0; i < 8; i++) {
			const ndir = (dir + i) % 8;
			const nx = x + dirs[ndir][0];
			const ny = y + dirs[ndir][1];
			if (!methodCtx.isBackground(nx, ny) && !methodCtx.visited[ny * methodCtx.canvas.width + nx]) {
				x = nx;
				y = ny;
				contour.push({ x, y });
				methodCtx.visited[y * methodCtx.canvas.width + x] = true;
				minX = Math.min(minX, x);
				maxX = Math.max(maxX, x);
				minY = Math.min(minY, y);
				maxY = Math.max(maxY, y);
				dir = (ndir + 6) % 8; // Turn left
				found = true;
				break;
			}
		}
		if (!found) break;
	} while (!(x === startX && y === startY));

	// Optionally, fill inside the contour as visited (to avoid double-detection)
	// Simple scanline fill:
	for (let yy = minY; yy <= maxY; yy++) {
		let inShape = false;
		for (let xx = minX; xx <= maxX; xx++) {
			if (!methodCtx.isBackground(xx, yy)) {
				if (!methodCtx.visited[yy * methodCtx.canvas.width + xx]) inShape = !inShape;
				methodCtx.visited[yy * methodCtx.canvas.width + xx] = true;
			} else if (inShape) {
				methodCtx.visited[yy * methodCtx.canvas.width + xx] = true;
			}
		}
	}

	return {
		x: minX,
		y: minY,
		width: maxX - minX + 1,
		height: maxY - minY + 1,
	};
}
