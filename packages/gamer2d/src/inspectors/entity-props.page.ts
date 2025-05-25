import type { EntitiesLayer } from "../layers/entities.layer";
import type Director from "../scene/Director";
import { DebugPage } from "./debug-page.class";
import type { PropertiesInspector } from "./elements/properties.inspector";

export class EntityPropsPage extends DebugPage {
	private menu!: HTMLElement;
	private layer!: EntitiesLayer;

	constructor(
		public coppola: Director,
		public title: string,
		private params: { entityId },
	) {
		super(coppola, title);
	}

	render(): HTMLElement {
		this.menu = document.createElement("div");
		this.menu.appendChild(createTemplate());
		return this.menu;
	}

	open() {
		const propsInspector = this.menu.querySelector("properties-inspector") as PropertiesInspector;
		this.coppola.currentScene.useLayer("entities", (layer: EntitiesLayer) => {
			this.layer = layer;

			layer.selectEntity(this.params.entityId);

			const selectedEntity = layer.get(this.params.entityId) as unknown as Record<string, unknown>;
			layer.debugCallback = () => propsInspector.update(selectedEntity);
		});
	}

	close() {
		this.layer.debugCallback = undefined;
	}
}

function createTemplate() {
	const template = document.createElement("template");
	template.innerHTML = "<properties-inspector></properties-inspector>";
	return template.content.cloneNode(true) as HTMLElement;
}
