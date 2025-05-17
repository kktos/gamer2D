import type { Rect } from "gamer2d/maths/math";

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
export function detectSprites(canvas, options = {}) {
	// Default options
	const defaultOptions = {
		minWidth: 10,
		minHeight: 10,
		backgroundColor: [0, 0, 0, 0], // Default transparent (RGBA)
		tolerance: 10, // Default color tolerance
	};

	// Merge options with defaults
	const config = { ...defaultOptions, ...options };

	// Get canvas context and image data
	const ctx = canvas.getContext("2d");
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const data = imageData.data;

	// Create a visited map to track processed pixels
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
			Math.abs(r - config.backgroundColor[0]) <= config.tolerance &&
			Math.abs(g - config.backgroundColor[1]) <= config.tolerance &&
			Math.abs(b - config.backgroundColor[2]) <= config.tolerance &&
			Math.abs(a - config.backgroundColor[3]) <= config.tolerance
		);
	}

	// Function to perform flood fill and find sprite boundaries
	function floodFill(startX, startY) {
		const stack = [{ x: startX, y: startY }];
		let minX = startX;
		let maxX = startX;
		let minY = startY;
		let maxY = startY;

		// Visit the start pixel
		visited[startY * canvas.width + startX] = true;

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
				const idx = ny * canvas.width + nx;

				// If pixel is valid, not background, and not visited
				if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height && !isBackground(nx, ny) && !visited[idx]) {
					// Mark as visited and add to stack
					visited[idx] = true;
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

	// Find all sprites in the canvas
	const sprites: Rect[] = [];

	for (let y = 0; y < canvas.height; y++) {
		for (let x = 0; x < canvas.width; x++) {
			// Skip if already visited or is background
			if (visited[y * canvas.width + x] || isBackground(x, y)) {
				continue;
			}

			// This is a new sprite, perform flood fill
			const sprite = floodFill(x, y);

			// Only add sprite if it meets the minimum size requirements
			if (sprite.width >= config.minWidth && sprite.height >= config.minHeight) {
				sprites.push(sprite);
			}
		}
	}

	if (canvas.width > canvas.height) sprites.sort((a, b) => a.x - b.x);
	else sprites.sort((a, b) => a.y - b.y);

	return sprites;
}

/**
 * Extracts individual sprite images from a canvas
 *
 * @param {HTMLCanvasElement} canvas - The canvas containing sprites
 * @param {Array<Object>} sprites - Array of sprite boundaries from detectSprites
 * @returns {Array<Object>} - Array of sprite images with position data
 */
// function extractSpriteImages(canvas, sprites) {
// 	const ctx = canvas.getContext("2d");
// 	const spriteImages = [];

// 	sprites.forEach((sprite, index) => {
// 		// Create a new canvas for each sprite
// 		const spriteCanvas = document.createElement("canvas");
// 		spriteCanvas.width = sprite.width;
// 		spriteCanvas.height = sprite.height;
// 		const spriteCtx = spriteCanvas.getContext("2d");

// 		// Draw the sprite onto the new canvas
// 		spriteCtx.drawImage(canvas, sprite.x, sprite.y, sprite.width, sprite.height, 0, 0, sprite.width, sprite.height);

// 		// Add to the result array
// 		spriteImages.push({
// 			id: index,
// 			image: spriteCanvas,
// 			x: sprite.x,
// 			y: sprite.y,
// 			width: sprite.width,
// 			height: sprite.height,
// 		});
// 	});

// 	return spriteImages;
// }

/**
 * Example usage:
 *
 * const canvas = document.getElementById('game-canvas');
 * const sprites = detectSprites(canvas, {
 *   minWidth: 20,
 *   minHeight: 20,
 *   backgroundColor: [255, 255, 255, 255], // white
 *   tolerance: 15
 * });
 *
 * // Extract individual sprite images
 * const spriteImages = extractSpriteImages(canvas, sprites);
 *
 * // Do something with the detected sprites
 * console.log(`Found ${sprites.length} sprites.`);
 * sprites.forEach(sprite => {
 *   console.log(`Sprite at (${sprite.x}, ${sprite.y}) with size ${sprite.width}x${sprite.height}`);
 * });
 */
