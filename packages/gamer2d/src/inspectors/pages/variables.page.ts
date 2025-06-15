import type { UiLayer } from "../../layers/ui.layer";
import type { Director } from "../../scene/Director";
import type { PropertiesInspector } from "../elements/properties.inspector";
import { DebugPage } from "./debug-page.class";

export class VariablesPage extends DebugPage {
	private element!: HTMLElement;
	private layer!: UiLayer;

	constructor(
		public coppola: Director,
		public title: string,
		private params: { data },
	) {
		super(coppola, title);
	}

	render(): HTMLElement {
		this.element = document.createElement("div");
		this.element.appendChild(createTemplate());
		return this.element;
	}

	open() {
		const varsInspector = this.element.querySelector("properties-inspector") as PropertiesInspector;
		const vars = this.params.data;
		this.coppola.currentScene.useLayer("entities", (layer: UiLayer) => {
			this.layer = layer;
			layer.debugCallback = () => varsInspector.update(vars);
		});
	}

	close() {
		this.layer.debugCallback = undefined;
	}
}

function createTemplate() {
	const template = document.createElement("template");
	template.innerHTML = `
		<properties-inspector></properties-inspector>
	`;
	return template.content.cloneNode(true) as HTMLElement;
}
