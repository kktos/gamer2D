import type { EntitiesLayer } from "../layers/entities.layer";
import { DebugPage } from "./debug-page.class";
import type { EntityList } from "./elements/items.inspector";
import type { PageKey } from "./pages-definitions";

export class EntitiesPage extends DebugPage {
	private element!: EntityList;
	private layer!: EntitiesLayer;

	render(): HTMLElement {
		this.element = document.createElement("items-inspector") as EntityList;
		return this.element;
	}

	open() {
		const entityList = this.element;

		this.coppola.currentScene.useLayer("entities", (layer: EntitiesLayer) => {
			let entityId = "";
			this.layer = layer;

			const showEntityListInspector = () => {
				entityList.setEntities(layer.entities);
				entityList.show();
				layer.debugCallback = () => entityList.updateEntities(layer.entities, entityId);
			};

			showEntityListInspector();

			entityList.addEventListener("item-selected", (event) => {
				const customEvent = event as CustomEvent;
				entityId = customEvent.detail?.entityId;
				if (entityId) layer.selectEntity(entityId);
			});

			entityList.addEventListener("inspect-item", (event) => {
				const customEvent = event as CustomEvent;
				const entityId = customEvent.detail?.entityId;
				if (entityId) {
					entityList.dispatchEvent(
						new CustomEvent("goto-page", {
							detail: { id: "entity-properties" as PageKey, params: { object: layer.get(entityId) } },
							bubbles: true,
							composed: true,
						}),
					);
				}
			});
		});
	}

	close() {
		this.layer.debugCallback = undefined;
		this.layer.selectEntity(-1);
	}
}
