import type { DisplayLayer } from "../layers/display.layer";
import type Director from "../scene/Director";
import { TText } from "../script/compiler/layers/display/layout/text.rules";
import { OP_TYPES_STR } from "../types/operation.types";
import { DebugPage } from "./debug-page.class";
import type { PropertiesInspector } from "./elements/properties.inspector";

export class LayoutPage extends DebugPage {
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
		const layout = this.params.data;
		this.coppola.currentScene.useLayer("entities", (layer: DisplayLayer) => {
			this.layer = layer;

			const props: unknown[] = [];
			for (const item of layout) {
				if (item instanceof TText) props.push(item);
				else props.push({ type: OP_TYPES_STR[item.type] });
			}

			layer.debugCallback = () => varsInspector.update(props);
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
