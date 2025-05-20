import type { Anim } from "gamer2d/game/Anim";
import { selectedAnim } from "../anims.store.js";
import template from "./spritesDetectorDlg.template.html?raw";

// Minimal tab-pane definition for styling
export class SpritesDetectorDlg extends HTMLElement {
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
		const form = this.querySelector<HTMLFormElement>("FORM");
		if (form) form.addEventListener("submit", (e) => e.preventDefault());

		const createBtn = this.querySelector<HTMLElement>("#detect-sprites");
		if (createBtn) {
			createBtn.addEventListener("click", () => this.handleDetectSprites());
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

	private handleDetectSprites() {
		const form = this.querySelector<HTMLFormElement>("FORM");
		if (!form) return;
		const data = new FormData(form);
		const options = {
			mode: data.get("mode"),
			name: data.get("spriteName"),
			minHeight: Number(data.get("minSpriteHeight")),
			minWidth: Number(data.get("minSpriteWidth")),
			height: Number(data.get("expectedSpriteHeight")),
			width: Number(data.get("expectedSpriteWidth")),
			toleranceRGB: Number(data.get("toleranceRGB")),
			toleranceAlpha: Number(data.get("toleranceAlpha")),
			bgcolor: [Number(data.get("r")), Number(data.get("g")), Number(data.get("b")), Number(data.get("a"))],
		};
		this.dispatchEvent(
			new CustomEvent("command", {
				bubbles: true,
				detail: { id: "detect-sprites", data: options },
			}),
		);
	}
}
customElements.define("sprites-detector-dlg", SpritesDetectorDlg);
