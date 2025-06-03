import type { RGBAColor } from "gamer2d/utils/canvas.utils";
import { pickedColor } from "../../shared/main.store.js";
import template from "./spritesDetectorDlg.template.html?raw";

export class SpritesDetectorDlg extends HTMLElement {
	private unsubColor?: () => void;

	private rInput: HTMLInputElement | null = null;
	private gInput: HTMLInputElement | null = null;
	private bInput: HTMLInputElement | null = null;
	private aInput: HTMLInputElement | null = null;

	static bootstrap() {
		if (!customElements.get("sprites-detector-dlg")) customElements.define("sprites-detector-dlg", SpritesDetectorDlg);
	}

	connectedCallback() {
		this.unsubColor = pickedColor.subscribe((color) => this.onPickedColorChanged(color));

		if (this.querySelector("form")) return;

		const templateElement = document.createElement("template");
		templateElement.innerHTML = template;
		const content = templateElement.content.cloneNode(true);
		this.appendChild(content);

		this.rInput = this.querySelector<HTMLInputElement>('input[name="r"]');
		this.gInput = this.querySelector<HTMLInputElement>('input[name="g"]');
		this.bInput = this.querySelector<HTMLInputElement>('input[name="b"]');
		this.aInput = this.querySelector<HTMLInputElement>('input[name="a"]');

		// Button handling
		const form = this.querySelector<HTMLFormElement>("FORM");
		if (form) form.addEventListener("submit", (e) => e.preventDefault());

		const createBtn = this.querySelector<HTMLElement>("#detect-sprites");
		if (createBtn) createBtn.addEventListener("click", () => this.handleDetectSprites());
	}

	disconnectedCallback() {
		this.unsubColor?.();
	}

	private onPickedColorChanged(color?: RGBAColor) {
		if (color) {
			document.body.style.setProperty("--image-bg-color", `rgba(${color.r},${color.g},${color.b},${color.a / 255})`);
			if (this.rInput) this.rInput.value = String(color.r);
			if (this.gInput) this.gInput.value = String(color.g);
			if (this.bInput) this.bInput.value = String(color.b);
			if (this.aInput) this.aInput.value = String(color.a);
		} else {
			document.body.style.removeProperty("--image-bg-color");
			// Reset to default values from the template (or sensible defaults)
			// Assuming the template has value="0" for r,g,b and value="255" for a
			if (this.rInput) this.rInput.value = this.rInput.defaultValue ?? "0";
			if (this.gInput) this.gInput.value = this.gInput.defaultValue ?? "0";
			if (this.bInput) this.bInput.value = this.bInput.defaultValue ?? "0";
			if (this.aInput) this.aInput.value = this.aInput.defaultValue ?? "255";
		}
	}

	private handleDetectSprites() {
		const form = this.querySelector<HTMLFormElement>("FORM");
		if (!form) return;
		const data = new FormData(form);
		const options = {
			mode: data.get("mode"),
			name: data.get("spriteName"),
			scale: Number(data.get("scale")),
			minHeight: Number(data.get("minSpriteHeight")),
			minWidth: Number(data.get("minSpriteWidth")),
			height: Number(data.get("expectedSpriteHeight")),
			width: Number(data.get("expectedSpriteWidth")),
			toleranceRGB: Number(data.get("toleranceRGB")),
			toleranceAlpha: Number(data.get("toleranceAlpha")),
			bgcolor: [Number(data.get("r")), Number(data.get("g")), Number(data.get("b")), Number(data.get("a"))],
			method: data.get("method"),
		};
		this.dispatchEvent(
			new CustomEvent("command", {
				bubbles: true,
				detail: { id: "detect-sprites", data: options },
			}),
		);
	}
}
