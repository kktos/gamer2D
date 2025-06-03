import { selectedSprites } from "../../shared/main.store.js";
import template from "./spriteDlg.template.html?raw";

// Minimal tab-pane definition for styling
export class SpriteDlg extends HTMLElement {
	private unsub?: () => void;

	static bootstrap() {
		if (!customElements.get("sprite-dlg")) customElements.define("sprite-dlg", SpriteDlg);
	}

	connectedCallback() {
		this.unsub = selectedSprites.subscribe((names) => {
			console.log("selectedSprites", selectedSprites);

			if (!names) return;
			this.onSelectedSpritesChanged([...names]);
		});

		if (this.querySelector("form")) return;

		const templateElement = document.createElement("template");
		templateElement.innerHTML = template;
		const content = templateElement.content.cloneNode(true);
		this.appendChild(content);

		// Button handling
		const form = this.querySelector<HTMLFormElement>("#spriteForm");
		if (form) form.addEventListener("submit", (e) => e.preventDefault());

		const createBtn = this.querySelector<HTMLElement>("#save-sprite");
		if (createBtn) createBtn.addEventListener("click", () => this.saveSprite());
	}

	disconnectedCallback() {
		this.unsub?.();
	}

	private onSelectedSpritesChanged(names: string[]) {
		const nameInput = this.querySelector<HTMLInputElement>('input[name="name"]');
		if (nameInput) nameInput.value = names[0].replace(/-\d+$/, "");

		const framesInput = this.querySelector<HTMLSelectElement>('select[name="frames"]');
		if (framesInput) framesInput.innerHTML = names.map((opt) => `<option value="${opt}">${opt}</option>`).join("");
	}

	private saveSprite() {
		const form = this.querySelector<HTMLFormElement>("#spriteForm");
		if (!form) return;
		const data = new FormData(form);
		const name = data.get("name") as string;
		this.dispatchEvent(
			new CustomEvent("command", {
				bubbles: true,
				detail: { id: "save-sprite", data: { name } },
			}),
		);
	}
}
