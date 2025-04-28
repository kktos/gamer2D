import type GameContext from "../game/types/GameContext";
import type { Scene } from "../scene/Scene";
import type { SceneSheetUI } from "../script/compiler/layers/display/display.rules";
import { Layer } from "./Layer";

export class UILayer extends Layer {
	private ui: HTMLElement;

	constructor(gc: GameContext, parent: Scene, layout?: SceneSheetUI) {
		super(gc, parent);

		const ui = document.getElementById("ui");
		if (!ui) {
			throw TypeError("No UI element found !?!");
		}
		this.ui = ui;

		if (layout) {
			this.ui.className = layout.pos === "top" ? "top" : "bottom";

			if (layout.background) this.ui.style.backgroundColor = layout.background.value;

			this.ui.innerHTML = `
				<div class="grid-column header">
					<div id="btnBack" class="btn light-shadow icn icn-left-arrow"></div>
				</div>
				<div class="grid-column content">
				</div>
			`;

			const header = document.querySelector("#ui > .header");
			if (!header) throw TypeError("No UI Header element found !?!");
			this.bindEvents(header, this);
		} else this.ui.className = "";
	}

	setContent(html: string, handler?: unknown) {
		const contentElm = document.querySelector("#ui > .content");
		if (!contentElm) {
			throw TypeError("No #ui > .content element found !?!");
		}
		contentElm.innerHTML = html;
		this.bindEvents(contentElm, handler ?? this);
	}

	bindEvents(elm: Element, handler) {
		const btnList = elm.querySelectorAll(".btn");
		for (let idx = 0; idx < btnList.length; idx++) {
			btnList[idx].addEventListener("click", (evt) => evt.target instanceof Element && evt.isTrusted && handler.onClickUIBtn(btnList[idx].id));
		}

		const inputList = elm.querySelectorAll("INPUT,SELECT");
		for (let idx = 0; idx < inputList.length; idx++) {
			inputList[idx].addEventListener("change", (evt: Event) => {
				if (!(evt.target instanceof HTMLInputElement || evt.target instanceof HTMLSelectElement)) return;
				if (!evt.isTrusted) return;
				handler.onChangeUI(evt.target);
			});
		}
	}

	goBack() {
		if (!this.gc.scene) {
			throw TypeError("No previous Scene to go to !?!");
		}

		this.destroy();
		this.ui.innerHTML = "";
		this.gc.scene.goto("menu");
	}

	onClickUIBtn(id) {
		switch (id) {
			case "btnBack":
				this.goBack();
				break;
		}
	}

	handleEvent(gc, e) {}
	destroy() {}
	render(dt) {}
}
