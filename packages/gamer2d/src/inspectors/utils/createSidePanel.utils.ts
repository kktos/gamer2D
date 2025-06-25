import type { SidePanel } from "../elements/side-panel.element";

export function createSidePanel(_root: HTMLElement) {
	const sidePanel = document.createElement("side-panel") as SidePanel;
	sidePanel.id = "inspector";
	sidePanel.side = "right";

	sidePanel.style.setProperty("--panel-width", "400px");
	sidePanel.style.setProperty("--panel-bg-color", "rgb(0 0 0 / 40%)");
	// --panel-header-bg-color: rgb(16 122 245 / 70%);
	// --panel-header-color: white;

	return sidePanel;
}
