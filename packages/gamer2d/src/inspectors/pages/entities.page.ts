import type { Entity } from "../../entities/Entity";
import type { EntitiesLayer } from "../../layers";
import type { ItemList, TableColumn } from "../elements/items.inspector";
import { DebugPage } from "./debug-page.class";
import type { PageKey } from "./pages-definitions";

const columns: TableColumn<Entity>[] = [
	{ key: "class", label: "Class", width: 120 },
	{ key: "id", label: "ID", width: 80 },
	{ key: "bbox", label: "Left", width: 60, render: (item) => item.bbox.left.toFixed() },
	{ key: "bbox", label: "Top", width: 60, render: (item) => item.bbox.top.toFixed() },
];

export class EntitiesPage extends DebugPage {
	private element!: ItemList<Entity>;
	private layer!: EntitiesLayer;

	render(): HTMLElement {
		this.element = document.createElement("items-inspector") as ItemList<Entity>;
		return this.element;
	}

	open() {
		const entityList = this.element;

		this.coppola.currentScene.useLayer("entities", (layer: EntitiesLayer) => {
			let entityId = "";
			this.layer = layer;

			const showEntityListInspector = () => {
				entityList.setColumns(columns, (item) => item.id);
				entityList.setItems(layer.entities);
				entityList.show();
				layer.debugCallback = () => entityList.updateItems(layer.entities, entityId);
			};

			showEntityListInspector();

			entityList.addEventListener("item-selected", (event) => {
				const customEvent = event as CustomEvent;
				entityId = customEvent.detail?.id;
				if (entityId) layer.selectEntity(entityId);
			});

			entityList.addEventListener("inspect-item", (event) => {
				const customEvent = event as CustomEvent;
				const entityId = customEvent.detail?.id;
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
