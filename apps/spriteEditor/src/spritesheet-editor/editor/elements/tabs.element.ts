export class TabsContainer extends HTMLElement {
	static bootstrap() {
		if (!customElements.get("tabs-container")) customElements.define("tabs-container", TabsContainer);
		if (!customElements.get("tab-pane")) customElements.define("tab-pane", TabPane);
	}

	connectedCallback() {
		this.renderTabs();
	}

	renderTabs() {
		const panes = Array.from(this.querySelectorAll("tab-pane"));
		if (panes.length === 0) return;

		// Create tabs bar
		const tabsBar = document.createElement("div");
		tabsBar.className = "tabs";
		panes.forEach((pane, idx) => {
			const btn = document.createElement("button");
			btn.className = "tab-btn";
			btn.textContent = pane.getAttribute("label") || `Tab ${idx + 1}`;
			btn.dataset.tab = pane.id;
			if (pane.hasAttribute("active")) btn.classList.add("active");
			btn.addEventListener("click", () => this.activateTab(pane.id));
			tabsBar.appendChild(btn);
		});

		// Wrap panes in a container
		const content = document.createElement("div");
		content.className = "tab-content";
		panes.forEach((pane, idx) => {
			pane.classList.add("tab-pane");
			if (pane.hasAttribute("active")) pane.classList.add("active");
			else pane.classList.remove("active");
			content.appendChild(pane);
		});

		// Clear and append
		this.innerHTML = "";
		this.appendChild(tabsBar);
		this.appendChild(content);
	}

	activateTab(tabId: string) {
		const tabs = this.querySelectorAll(".tab-btn");
		const panes = this.querySelectorAll("tab-pane");
		// biome-ignore lint/complexity/noForEach: <explanation>
		tabs.forEach((btn) => {
			if ((btn as HTMLElement).dataset.tab === tabId) btn.classList.add("active");
			else btn.classList.remove("active");
		});
		// biome-ignore lint/complexity/noForEach: <explanation>
		panes.forEach((pane) => {
			if ((pane as HTMLElement).id === tabId) pane.classList.add("active");
			else pane.classList.remove("active");
		});
		// Call render function if specified
		const pane = this.querySelector<HTMLElement>(`tab-pane#${tabId}`);
		const renderFn = pane?.getAttribute("data-render");
		if (renderFn)
			this.dispatchEvent(
				new CustomEvent("tab-render", {
					bubbles: true,
					detail: { tabId, renderFn, pane },
				}),
			);
	}
}

// Minimal tab-pane definition for styling
class TabPane extends HTMLElement {
	connectedCallback() {
		this.style.display = this.classList.contains("active") ? "" : "none";
	}
	static get observedAttributes() {
		return ["class"];
	}
	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		if (name === "class") this.style.display = this.classList.contains("active") ? "" : "none";
	}
}
