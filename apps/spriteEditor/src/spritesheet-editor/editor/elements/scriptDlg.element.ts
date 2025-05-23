import { CompileSyntaxErr, compile } from "gamer2d/script/compiler/compiler";
import type { TSpriteSheet } from "gamer2d/script/compiler/ressources/spritesheet.rules";
import { createSpriteSheet } from "gamer2d/utils/createSpriteSheet.util";
import { sourceImage, spritesheetSourceText } from "../../shared/main.store.js";
import template from "./scriptDlg.template.html?raw";

export class ScriptDlg extends HTMLElement {
	private unsub?: () => void;

	connectedCallback() {
		this.unsub = spritesheetSourceText.subscribe((value) => {
			if (value) {
				const scriptElement = this.querySelector("#script") as HTMLTextAreaElement;
				scriptElement.value = value;
			}
		});

		if (this.querySelector("textarea")) return;

		const templateElement = document.createElement("template");
		templateElement.innerHTML = template;
		const content = templateElement.content.cloneNode(true);
		this.appendChild(content);

		const btns = this.querySelectorAll<HTMLElement>(".btn");
		// biome-ignore lint/complexity/noForEach: <explanation>
		if (btns) btns.forEach((btn) => btn.addEventListener("click", (e) => this.onClick(e)));
	}

	disconnectedCallback() {
		this.unsub?.();
	}

	private onClick(e) {
		let data: unknown;
		switch (e.target.id) {
			case "compile-script":
				data = this.compile();
				break;

			case "check-script":
				return this.check();

			case "save-script":
				return this.save();
		}

		this.dispatchEvent(
			new CustomEvent("command", {
				bubbles: true,
				detail: { id: e.target.id, data },
			}),
		);
	}

	private save() {
		const sheet = this.check();

		const scriptElement = this.querySelector("#script") as HTMLTextAreaElement;
		const script = scriptElement.value;

		const blob = new Blob([script], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${sheet?.name ?? "spriteSheet"}.script`;
		a.click();
		URL.revokeObjectURL(url);
	}

	private compile() {
		const sheet = this.check();
		if (!sheet) return;
		if (!sourceImage.value) return;
		const ss = createSpriteSheet(sheet, sourceImage.value);
		return { ss, image: sheet.image };
	}

	private check() {
		const errorsElement = this.querySelector("#errors") as HTMLDivElement;
		try {
			errorsElement.classList.add("hidden");
			const scriptElement = this.querySelector("#script") as HTMLTextAreaElement;
			return compile<TSpriteSheet>(scriptElement.value, "spriteSheet");
		} catch (e) {
			if (e instanceof CompileSyntaxErr) {
				errorsElement.innerHTML = `
									<div>error: ${e.message}</div>
									<div>line : ${e.line}</div>
									<div>at   : ${e.word}</div>
									<div>rule  : ${e.ruleStack}</div>`;
				errorsElement.classList.remove("hidden");
			} else console.error(e);
		}
	}
}
customElements.define("script-dlg", ScriptDlg);
