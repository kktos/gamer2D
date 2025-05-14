import type { Rect } from "gamer2d/maths/math";

/**
 * Captures a rectangular area from a canvas and scans it for non-transparent sprites.
 * It identifies contiguous regions of non-transparent pixels and returns their bounding boxes.
 *
 * @param canvas The HTMLCanvasElement to capture from.
 * @param captureRect An object { x, y, width, height } defining the rectangle to capture from the canvas.
 *                    Coordinates are relative to the canvas.
 * @returns An array of SpriteBoundingBox objects, each representing a detected sprite.
 *          Coordinates in SpriteBoundingBox are relative to the top-left of the `captureRect`.
 */
export function findSpritesInCanvasRect(canvas: HTMLCanvasElement, captureRect: { x: number; y: number; width: number; height: number }): Rect[] {
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		console.error("Canvas 2D context not available. Cannot find sprites.");
		return [];
	}

	if (captureRect.width <= 0 || captureRect.height <= 0) {
		console.warn("Capture rectangle width and height must be positive to find sprites.");
		return [];
	}

	let imageData: ImageData;
	try {
		// getImageData clamps the source rectangle to the canvas dimensions.
		// It can throw errors for invalid width/height (e.g., 0, NaN, Infinity).
		imageData = ctx.getImageData(captureRect.x, captureRect.y, captureRect.width, captureRect.height);
	} catch (e) {
		console.error("Failed to get ImageData from canvas. Ensure captureRect parameters are valid or check for other canvas issues.", e);
		return [];
	}

	const { width: imgWidth, height: imgHeight, data } = imageData;
	const sprites: Rect[] = [];

	// 2D array to keep track of visited pixels
	const visited: boolean[][] = Array.from({ length: imgHeight }, () => Array(imgWidth).fill(false));

	for (let r = 0; r < imgHeight; r++) {
		// r for row (y-coordinate in the captured area)
		for (let c = 0; c < imgWidth; c++) {
			// c for column (x-coordinate in the captured area)

			if (visited[r][c]) {
				continue; // Skip already visited pixels
			}

			const pixelStartIndex = (r * imgWidth + c) * 4; // Each pixel has 4 components (R,G,B,A)
			const alpha = data[pixelStartIndex + 3]; // Alpha component is the 4th one (index 3)

			if (alpha === 0) {
				// Pixel is transparent
				visited[r][c] = true; // Mark as visited and continue
				continue;
			}

			// Found an unvisited, non-transparent pixel: this is the start of a new sprite region
			let minSpriteX = c;
			let maxSpriteX = c;
			let minSpriteY = r;
			let maxSpriteY = r;

			// Use a queue for Breadth-First Search (BFS) to find all connected non-transparent pixels
			const queue: { x: number; y: number }[] = [{ x: c, y: r }];
			visited[r][c] = true; // Mark the starting pixel as visited
			let head = 0; // BFS queue pointer

			while (head < queue.length) {
				const { x: currentX, y: currentY } = queue[head++];

				// Update the bounding box for the current sprite being formed
				minSpriteX = Math.min(minSpriteX, currentX);
				maxSpriteX = Math.max(maxSpriteX, currentX);
				minSpriteY = Math.min(minSpriteY, currentY);
				maxSpriteY = Math.max(maxSpriteY, currentY);

				// Define 4-directional neighbors (up, down, left, right)
				// const neighbors = [
				// 	{ dx: 0, dy: -1 }, // Up
				// 	{ dx: 0, dy: 1 }, // Down
				// 	{ dx: -1, dy: 0 }, // Left
				// 	{ dx: 1, dy: 0 }, // Right
				// ];
				const neighbors = [
					{ dx: 0, dy: -1 }, // Up
					{ dx: 0, dy: 1 }, // Down
					{ dx: -1, dy: 0 }, // Left
					{ dx: 1, dy: 0 }, // Right
					{ dx: -1, dy: -1 },
					{ dx: 1, dy: -1 },
					{ dx: -1, dy: 1 },
					{ dx: 1, dy: 1 },
				];

				for (const { dx, dy } of neighbors) {
					const neighborX = currentX + dx;
					const neighborY = currentY + dy;

					// Check if the neighbor is within the bounds of the captured image
					if (neighborX >= 0 && neighborX < imgWidth && neighborY >= 0 && neighborY < imgHeight) {
						if (!visited[neighborY][neighborX]) {
							// If neighbor hasn't been visited
							const neighborPixelStartIndex = (neighborY * imgWidth + neighborX) * 4;
							const neighborAlpha = data[neighborPixelStartIndex + 3];

							if (neighborAlpha > 0) {
								// If neighbor is non-transparent
								visited[neighborY][neighborX] = true; // Mark as visited
								queue.push({ x: neighborX, y: neighborY }); // Add to BFS queue
							} else {
								// If neighbor is transparent, mark it as visited so we don't check it again
								visited[neighborY][neighborX] = true;
							}
						}
					}
				}
			}

			// BFS for this connected component (sprite) is complete.
			// Store its bounding box.
			sprites.push({
				x: minSpriteX,
				y: minSpriteY,
				width: maxSpriteX - minSpriteX + 1,
				height: maxSpriteY - minSpriteY + 1,
			});
		}
	}

	return sprites;
}

/**
 * Creates a new canvas containing a copy of a specified rectangular area from an existing canvas.
 *
 * @param sourceCanvas The HTMLCanvasElement to copy from.
 * @param captureRect An object { x, y, width, height } defining the rectangle to capture from the source canvas.
 *                    Coordinates are relative to the source canvas.
 * @returns A new HTMLCanvasElement containing the captured area, or null if an error occurs.
 */
export function createCanvasFromRect(
	sourceCanvas: HTMLCanvasElement | HTMLImageElement,
	captureRect: { x: number; y: number; width: number; height: number },
): HTMLCanvasElement | null {
	if (captureRect.width <= 0 || captureRect.height <= 0) {
		console.warn("Capture rectangle width and height must be positive to create a new canvas.");
		return null;
	}

	const newCanvas = document.createElement("canvas");
	newCanvas.width = captureRect.width;
	newCanvas.height = captureRect.height;

	const newCtx = newCanvas.getContext("2d");
	if (!newCtx) {
		console.error("Failed to get 2D context for the new canvas.");
		return null;
	}

	try {
		// Draw the specified portion of the source canvas onto the new canvas
		newCtx.drawImage(
			sourceCanvas,
			captureRect.x, // Source X
			captureRect.y, // Source Y
			captureRect.width, // Source Width
			captureRect.height, // Source Height
			0, // Destination X
			0, // Destination Y
			captureRect.width, // Destination Width
			captureRect.height, // Destination Height
		);
	} catch (e) {
		console.error("Error drawing image from source canvas to new canvas:", e);
		return null; // Return null if drawImage fails (e.g., due to tainted canvas or invalid arguments)
	}

	return newCanvas;
}
