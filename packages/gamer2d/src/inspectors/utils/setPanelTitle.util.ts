import type { SidePanel } from "../elements/side-panel.element";

export const pageHistory: (() => void)[] = [];

export function setPanelTitle(panel: SidePanel, title: string) {
	const previousHeaders = panel.querySelectorAll('[slot="header"]');
	// biome-ignore lint/complexity/noForEach: <explanation>
	previousHeaders.forEach((header) => panel.removeChild(header));

	if (pageHistory.length > 0) {
		const btn = createBackButton(panel);
		btn.slot = "header";
		panel.appendChild(btn);
	}

	const header = document.createElement("span");
	header.slot = "header";
	header.textContent = title;
	panel.appendChild(header);
}

function createBackButton(root: HTMLElement) {
	const icon = `
		<svg 
			style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" 
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 199.404 199.404">
		<g>
			<polygon
				points="199.404,81.529 74.742,81.529 127.987,28.285 99.701,0 0,99.702 99.701,199.404 
				127.987,171.119 74.742,117.876 199.404,117.876"/>
		</g>
		</svg>
		`;
	const btn = document.createElement("button");
	btn.innerHTML = icon;
	btn.style.cssText = `
		background: transparent;
		border: none;
		color: white;
		vertical-align: middle;
	`;

	btn.addEventListener("click", () => {
		const backFn = pageHistory.pop();
		if (backFn) backFn();
	});

	return btn;
}
