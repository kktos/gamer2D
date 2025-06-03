import type { Entity } from "../../entities/Entity";
import type { DisplayLayer } from "../../layers/display.layer";
import type { Director } from "../../scene/Director";
import { evalVar } from "../../script/engine/eval.script";
import type { PropertiesInspector } from "../elements/properties.inspector";
import { DebugPage } from "./debug-page.class";

export class LayoutItemPropsPage extends DebugPage {
	private element!: PropertiesInspector;

	constructor(
		public coppola: Director,
		public title: string,
		private params: { data },
	) {
		super(coppola, title);
		const objectName = this.params?.data?.name;
		if (objectName) this.title = `${this.title} ${objectName}`;
	}

	render(): HTMLElement {
		this.element = document.createElement("properties-inspector") as PropertiesInspector;
		return this.element;
	}

	open() {
		this.coppola.currentScene.useLayer("display", (layer: DisplayLayer) => {
			this.element.setPropertyConfigs({
				width: { editor: "number" },
				height: { editor: "number" },
				color: { editor: "rgba" },
				bgcolor: { editor: "rgba" },
				fill: { editor: "rgba" },
				pos: { editor: "point" },
				value: { editor: "array" },
				entity: {
					renderer: (value) => {
						const entity = value as Entity;
						return `${entity.class} id:${entity.id}`;
					},
				},
			});

			this.element.evalValue = (name: string) => evalVar({ vars: layer.vars }, name);

			const item = this.params.data;

			layer.debugCallback = () => {
				this.element.update(item);
			};

			this.element.addEventListener("property-changed", (event) => {
				const customEvent = event as CustomEvent;
				const key = customEvent.detail?.key as string;
				const value = customEvent.detail?.value;
				item[key] = value;
				console.log("property-changed", key, value);
			});
		});
	}

	close() {}
}
