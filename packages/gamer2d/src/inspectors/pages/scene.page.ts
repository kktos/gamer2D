import type { Director } from "../../scenes/Director";
import type { LayerMap } from "../../scenes/Scene";
import type { DebugMenuItemElement } from "../elements/debug-menu-item.element";
import type { DebugMenu } from "../elements/debug-menu.element";
import type { PropertiesInspector } from "../elements/properties.inspector";
import { DebugPage } from "./debug-page.class";

export class ScenePage extends DebugPage {
	private element!: HTMLElement;

	constructor(
		public coppola: Director,
		public title: string,
	) {
		super(coppola, title);
		const sceneName = this.coppola.currentScene?.name;
		if (sceneName) this.title += ` ${sceneName}`;
	}

	render(): HTMLElement {
		this.element = document.createElement("div");
		this.element.appendChild(createTemplate());
		return this.element;
	}

	open() {
		const propsInspector = this.element.querySelector("properties-inspector") as PropertiesInspector;
		const menu = this.element.querySelector("debug-menu") as DebugMenu;

		const scene = this.coppola.currentScene as unknown as Record<string, unknown>;
		const { layers, ...props } = { ...scene };

		for (const [name, layer] of layers as LayerMap) {
			const btn = document.createElement("debug-menu-item") as DebugMenuItemElement;
			menu.appendChild(btn);
			btn.innerText = name;
			btn.setAttribute("key", name);
			btn.data = layer;
		}
		propsInspector.update(props as Record<string, unknown>);
	}

	close() {}
}

function createTemplate() {
	const template = document.createElement("template");
	template.innerHTML = `
			<properties-inspector></properties-inspector>
			<h3>Layers</h3>
			<debug-menu></debug-menu>		
		`;
	return template.content.cloneNode(true) as HTMLElement;
}
