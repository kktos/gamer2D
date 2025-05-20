import type { Anim } from "gamer2d/game/Anim";
import { selectedAnim } from "../anims.store.js";
import template from "./animsDlg.template.html?raw";

// Minimal tab-pane definition for styling
export class AnimsDlg extends HTMLElement {
	private unsub?: () => void;

	connectedCallback() {
		this.unsub = selectedAnim.subscribe((animDef) => {
			if (!animDef) return;
			this.onSelectedAnimChanged(animDef);
		});

		if (this.querySelector("form")) return;

		const templateElement = document.createElement("template");
		templateElement.innerHTML = template;
		const content = templateElement.content.cloneNode(true);
		this.appendChild(content);

		// Button handling
		const form = this.querySelector<HTMLFormElement>("#animForm");
		if (form) form.addEventListener("submit", (e) => e.preventDefault());

		const createBtn = this.querySelector<HTMLElement>("#create-anim");
		if (createBtn) {
			createBtn.addEventListener("click", () => this.handleCreateAnim());
		}
	}

	disconnectedCallback() {
		this.unsub?.();
	}

	private onSelectedAnimChanged({ name, anim }: { name: string; anim: Anim }) {
		const nameInput = this.querySelector<HTMLInputElement>('input[name="name"]');
		if (nameInput) nameInput.value = name ?? "";
		const lengthInput = this.querySelector<HTMLInputElement>('input[name="length"]');
		if (lengthInput) lengthInput.value = String(anim.len ?? 1);
	}

	private handleCreateAnim() {
		const form = this.querySelector<HTMLFormElement>("#animForm");
		if (!form) return;
		const data = new FormData(form);
		const name = data.get("name") as string;
		const length = Number(data.get("length"));
		this.dispatchEvent(
			new CustomEvent("command", {
				bubbles: true,
				detail: { id: "create-anim", data: { name, length } },
			}),
		);
	}
}
customElements.define("anims-dlg", AnimsDlg);
