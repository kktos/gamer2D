import type { EntitiesLayer } from "../layers/entities.layer";
import { DebugPage } from "./debug-page.class";
import type { EntityList } from "./elements/items.inspector";
import { PAGES } from "./menu-page.class";

export class EntitiesPage extends DebugPage {
	private menu!: HTMLElement;
	private layer!: EntitiesLayer;

	render(): HTMLElement {
		this.menu = document.createElement("div");
		this.menu.appendChild(createTemplate());
		return this.menu;
	}

	open() {
		const entityList = this.menu.querySelector("items-inspector") as EntityList;

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
							detail: { pageDef: PAGES["entity-props"], params: { entityId } },
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

function createTemplate() {
	const template = document.createElement("template");
	template.innerHTML = "<items-inspector></items-inspector>";
	return template.content.cloneNode(true) as HTMLElement;
}
