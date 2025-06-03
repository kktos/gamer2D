import { sourceImage } from "../../shared/main.store.js";
import type { SpritesheetEditorView } from "../editor.view.js";

export function zoomImage(editor: SpritesheetEditorView, e) {
	const oldZoom = editor.zoom;

	// Calculate prospective new zoom
	let prospectiveNewZoom = oldZoom - e.deltaY * 0.001;

	// Clamp and round the new zoom
	prospectiveNewZoom = Math.min(prospectiveNewZoom, 10); // Max zoom
	prospectiveNewZoom = Math.max(prospectiveNewZoom, 1); // Min zoom (as per original logic)
	const newZoom = Math.floor(prospectiveNewZoom * 10) / 10;

	if (newZoom === oldZoom) {
		return; // No change in zoom level
	}

	const mouseX = e.x; // Mouse X relative to canvas
	const mouseY = e.y; // Mouse Y relative to canvas

	// Current image offsets (in world/unscaled units)
	const currentImageOffsetX = editor.imageOffsetX;
	const currentImageOffsetY = editor.imageOffsetY;

	// Calculate new offsets to keep the point under the mouse stationary
	editor.imageOffsetX = currentImageOffsetX + mouseX * (1 / newZoom - 1 / oldZoom);
	editor.imageOffsetY = currentImageOffsetY + mouseY * (1 / newZoom - 1 / oldZoom);

	// Update the instance's zoom property
	editor.zoom = newZoom;

	// Clamp the new offsets if the image is larger than the canvas
	// If smaller, centerIfSmaller in render() will handle positioning.
	const imgWidth = sourceImage.value?.width ?? 0;
	const imgHeight = sourceImage.value?.height ?? 0;
	const canvasWidth = editor.canvas.width;
	const canvasHeight = editor.canvas.height;

	if (imgWidth * editor.zoom > canvasWidth) {
		const minOffsetX_world = canvasWidth / editor.zoom - imgWidth;
		editor.imageOffsetX = Math.max(minOffsetX_world, Math.min(0, editor.imageOffsetX));
	}
	if (imgHeight * editor.zoom > canvasHeight) {
		const minOffsetY_world = canvasHeight / editor.zoom - imgHeight;
		editor.imageOffsetY = Math.max(minOffsetY_world, Math.min(0, editor.imageOffsetY));
	}
}
