import type { EntitiesLayer } from "../../layers";
import type { Director } from "../../scenes/Director";
import type { PropertiesInspector } from "../elements/properties.inspector";
import { DebugPage } from "./debug-page.class";

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

		propsInspector.propertyConfigs = {
			width: { editor: "number" },
			height: { editor: "number" },
			speed: { editor: "number" },
			fontsize: { editor: "number" },
			align: { editor: "number" },
			valign: { editor: "number" },
		};

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
