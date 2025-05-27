import type { EntitiesLayer } from "../layers/entities.layer";
import type Director from "../scene/Director";
import { DebugPage } from "./debug-page.class";
import type { PropertiesInspector } from "./elements/properties.inspector";

export class EntityPropsPage extends DebugPage {
	private element!: PropertiesInspector;
	private layer!: EntitiesLayer;

	constructor(
		public coppola: Director,
		public title: string,
		private params: { object },
	) {
		super(coppola, title);
	}

	render(): HTMLElement {
		this.element = document.createElement("properties-inspector") as PropertiesInspector;
		return this.element;
	}

	open() {
		const propsInspector = this.element;
		this.coppola.currentScene.useLayer("entities", (layer: EntitiesLayer) => {
			this.layer = layer;
			layer.selectEntity(this.params.object.id);
			layer.debugCallback = () => propsInspector.update(this.params.object);
		});
	}

	close() {
		this.layer.debugCallback = undefined;
	}
}
