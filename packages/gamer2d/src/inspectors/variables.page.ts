import type { DisplayLayer } from "../layers/display.layer";
import type Director from "../scene/Director";
import { DebugPage } from "./debug-page.class";
import type { PropertiesInspector } from "./elements/properties.inspector";

export class VariablesPage extends DebugPage {
	private element!: HTMLElement;
	private layer!: DisplayLayer;

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
		this.coppola.currentScene.useLayer("entities", (layer: DisplayLayer) => {
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
