import { getPixelColor } from "gamer2d/utils/canvas.utils";
import { pickedColor, sourceImage } from "../../shared/main.store.js";
import type { SpritesheetEditorView } from "../editor.view.js";

export const PIXEL_COLOR_THROTTLE_MSDELAY = 100;
let pixelColorThrottleTimeout: number | null = null;

export function throttledUpdatePixelColor(editor: SpritesheetEditorView, e: MouseEvent) {
	if (!sourceImage.value || !editor.srcImageData) return;

	// Store the latest event
	let lastMouseEventForPixelColor: MouseEvent | null = e;

	if (pixelColorThrottleTimeout === null) {
		// If no timeout is active, execute immediately
		updatePixelColorInfo(editor, lastMouseEventForPixelColor);
		lastMouseEventForPixelColor = null; // Clear stored event

		pixelColorThrottleTimeout = window.setTimeout(() => {
			pixelColorThrottleTimeout = null;
			// If there was a mouse event during the throttle period, process it now
			if (lastMouseEventForPixelColor) {
				updatePixelColorInfo(editor, lastMouseEventForPixelColor);
				lastMouseEventForPixelColor = null; // Clear stored event
			}
		}, PIXEL_COLOR_THROTTLE_MSDELAY);
	}
	// If a timeout is active, the latest event is already stored and will be processed
	// when the timeout completes (if it's still the latest).
}

function updatePixelColorInfo(editor: SpritesheetEditorView, e: MouseEvent) {
	if (!sourceImage.value || !editor.srcImageData) return;

	const mouseXOnCanvas = e.x;
	const mouseYOnCanvas = e.y;

	// Calculate precise floating-point coordinates on the 1x source image

	const xOnImage = Math.floor(mouseXOnCanvas / editor.zoom - editor.imageOffsetX);
	const yOnImage = Math.floor(mouseYOnCanvas / editor.zoom - editor.imageOffsetY);

	// Ensure the coordinates are within the valid bounds of the image data [0, width-1] and [0, height-1]
	if (xOnImage >= 0 && xOnImage < sourceImage.value.width && yOnImage >= 0 && yOnImage < sourceImage.value.height) {
		const pixelColor = getPixelColor(editor.srcImageData, xOnImage, yOnImage);
		pickedColor.value = pixelColor ?? undefined;
	} else pickedColor.value = undefined;
}
