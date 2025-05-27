import type { PageKey } from "../pages-definitions";
import type { DebugMenuItemElement } from "./debug-menu-item.element";

export interface MenuItem {
	id: string;
	label: string;
	data: unknown;
}

export class DebugMenu extends HTMLElement {
	private _items: MenuItem[] = [];

	constructor() {
		super();
		this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		if (!this.shadowRoot) return;
		this.shadowRoot.appendChild(createTemplate());
		this._processChildItems();
		this._renderButtons();

		// Optional: Observe for future changes to children if dynamic updates are needed
		const observer = new MutationObserver(() => {
			this._processChildItems();
			this._renderButtons();
		});
		observer.observe(this, { childList: true, subtree: true });
	}

	private _processChildItems() {
		this._items = [];
		const childItems = this.querySelectorAll<DebugMenuItemElement>("debug-menu-item");

		// biome-ignore lint/complexity/noForEach: Standard way to iterate NodeList
		childItems.forEach((itemNode) => {
			const id = itemNode.getAttribute("key") as PageKey | null;
			if (!id) return;
			const label = itemNode.textContent || id || "Untitled";
			this._items.push({ id, label, data: itemNode.data });
		});
	}

	private _renderButtons() {
		if (!this.shadowRoot) return;
		const container = this.shadowRoot.querySelector(".menu-container");
		if (!container) {
			console.error("DebugMenu: .menu-container not found in shadow DOM.");
			return;
		}

		container.innerHTML = "";

		// biome-ignore lint/complexity/noForEach: <explanation>
		this._items.forEach((item) => {
			const btn = document.createElement("button");
			btn.classList.add("menu-btn");
			btn.dataset.id = item.id;
			btn.textContent = item.label;

			btn.addEventListener("click", () => {
				this.dispatchEvent(
					new CustomEvent("menu-item-selected", {
						detail: { id: item.id, data: item.data },
						bubbles: true,
						composed: true,
					}),
				);
			});

			container.appendChild(btn);
		});
	}

	static bootstrap() {
		if (!customElements.get("debug-menu")) customElements.define("debug-menu", DebugMenu);
	}
}

function createTemplate(): DocumentFragment {
	const template = document.createElement("template");
	template.innerHTML = `
		<style>
			.menu-container {
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				gap: 12px;
				padding: 16px;
			}
			.menu-btn {
				padding: 10px 20px;
				font-size: 16px;
				cursor: pointer;
				border-radius: 6px;
				border: 1px solid #1976d2;
				background: transparent;
				color: white;
				transition: background 0.2s, color 0.2s;
				aspect-ratio: 1;
			}
			.menu-btn:hover {
				background: #1976d2;
				color: #fff;
			}
		</style>
		<div class="menu-container"></div>
	`;
	return template.content.cloneNode(true) as DocumentFragment;
}
