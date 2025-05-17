import type { GameContext } from "../game/types/GameContext";
import type { ResizablePanel } from "../inspectors/bottom.panel";
import { FloatingWindowElement } from "../inspectors/floating-window.element";
import type { Scene } from "../scene/Scene";
import type { SceneSheetUI } from "../script/compiler/layers/display/display.rules";
import { Layer } from "./Layer";

let uiElement: ResizablePanel | FloatingWindowElement | undefined = undefined;

export class UILayer extends Layer {
	constructor(gc: GameContext, parent: Scene, layout?: SceneSheetUI) {
		super(gc, parent);

		if (!layout) return;

		if (!uiElement) uiElement = createUI();

		// uiElement.className = layout.pos === "top" ? "top" : "bottom";

		if (layout.background) uiElement.style.backgroundColor = layout.background.value;

		// uiElement.innerHTML = `
		// 		<div class="grid-column header">
		// 			<div id="btnBack" class="btn light-shadow icn icn-left-arrow"></div>
		// 		</div>
		// 		<div class="grid-column content">
		// 		</div>
		// 	`;

		// this.bindEvents(header, this);
	}

	setContent(content: HTMLElement, handler?: unknown) {
		uiElement?.setContent(content);
		this.bindEvents(content, handler ?? this);
	}

	getContent() {
		return uiElement?.getContentElement();
	}

	bindEvents(elm: Element, handler) {
		const btnList = elm.querySelectorAll(".btn,BUTTON");
		for (let idx = 0; idx < btnList.length; idx++) {
			btnList[idx].addEventListener("click", (evt) => evt.target instanceof Element && evt.isTrusted && handler.onClickUIBtn(btnList[idx].id));
		}

		const inputList = elm.querySelectorAll("INPUT,SELECT,TEXTAREA");
		for (let idx = 0; idx < inputList.length; idx++) {
			inputList[idx].addEventListener("change", (evt: Event) => {
				if (!(evt.target instanceof HTMLInputElement || evt.target instanceof HTMLSelectElement)) return;
				if (!evt.isTrusted) return;
				handler.onChangeUI(evt.target);
			});
		}
	}

	goBack() {
		if (!this.gc.scene) throw TypeError("No previous Scene to go to !?!");

		this.destroy();
		if (uiElement) uiElement.innerHTML = "";
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

function createUI() {
	// ResizablePanel.bootstrap();
	// const panel = document.createElement("resizable-panel") as ResizablePanel;
	// panel.panelTitle = "Another Panel";
	// panel.initialHeight = 300;
	// panel.minHeight = 100;
	// panel.maxHeight = window.innerHeight * 0.4;
	// panel.closable = false;
	// panel.resizable = true;
	// panel.opened = true;
	// panel.panelZIndex = 1000;

	FloatingWindowElement.bootstrap();
	const panel = document.createElement("floating-window") as FloatingWindowElement;
	panel.title = "Tools";

	const width = 600;
	const height = 450;
	panel.setAttribute("initial-width", String(width));
	panel.setAttribute("initial-height", String(height));
	panel.setAttribute("initial-top", `${document.body.clientHeight - height - 10}px`);
	panel.setAttribute("initial-left", `${document.body.clientWidth - width - 10}px`);

	panel.style.setProperty("--window-bg-color", "rgb(0 0 0 / 85%)");
	panel.style.setProperty("--window-title-bg-color", "rgb(22 88 120 / 85%)");
	panel.style.setProperty("--window-color", "#FFF0F5");
	panel.style.setProperty("--window-content-padding", "0");

	document.body.appendChild(panel);

	return panel;
}
