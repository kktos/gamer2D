import type { PageKey } from "../pages/pages-definitions";

export class DebugMenuItemElement extends HTMLElement {
	public data: unknown;

	get key(): PageKey | null {
		return this.getAttribute("key") as PageKey | null;
	}
	set key(value: PageKey | null) {
		if (value) this.setAttribute("key", value);
		else this.removeAttribute("key");
	}

	get label(): string {
		return this.textContent || "";
	}

	static bootstrap(): void {
		if (!customElements.get("debug-menu-item")) customElements.define("debug-menu-item", DebugMenuItemElement);
	}
}
