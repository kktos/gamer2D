import type { EntitiesLayer } from "../layers/entities.layer";
import type Director from "../scene/Director";
import { EntityList } from "./elements/items.inspector";
import { PropertiesInspector } from "./elements/properties.inspector";
import { SidePanel } from "./elements/side-panel.element";
import { createItemsInspector } from "./utils/createItemsInspector.util";
import { createPropertiesInspector } from "./utils/createPropertiesInspector.util";
import { createSidePanel } from "./utils/createSidePanel.utils";
import { TRIGGER_BTN_ID, createTriggerBtn } from "./utils/createTriggerBtn.util";
import { pageHistory, setPanelTitle } from "./utils/setPanelTitle.util";

const GAMER2D_DEBUG = "gamer2d-debug";

export class DebugManager {
	private sidePanel!: SidePanel;
	private entityList!: EntityList;
	private entityInspector!: PropertiesInspector;

	constructor(private coppola: Director) {
		SidePanel.bootstrap();
		EntityList.bootstrap();
		PropertiesInspector.bootstrap();

		// activated per scene
		enableDebug(false);

		this.setup();
	}

	setup() {
		const root = document.createElement("div");
		root.id = GAMER2D_DEBUG;

		const triggerBtn = createTriggerBtn(root);
		root.append(triggerBtn);

		const panel = createSidePanel(root);
		root.append(panel);

		const entitiesInspector = createItemsInspector(root);
		panel.appendChild(entitiesInspector);

		const entityInspector = createPropertiesInspector(root);
		panel.appendChild(entityInspector);

		document.body.append(root);

		triggerBtn.addEventListener("click", () => this.show());

		this.sidePanel = document.querySelector(`#${GAMER2D_DEBUG} side-panel`) as SidePanel;
		this.entityList = this.sidePanel.querySelector("items-inspector") as EntityList;
		this.entityInspector = this.sidePanel.querySelector("properties-inspector") as PropertiesInspector;
	}

	show() {
		this.sidePanel.show();

		const triggerBtn = document.querySelector(`#${GAMER2D_DEBUG} #${TRIGGER_BTN_ID}`) as HTMLElement;
		triggerBtn.style.visibility = "hidden";

		this.coppola.currentScene.useLayer("entities", (layer: EntitiesLayer) => {
			const showEntityListInspector = () => {
				setPanelTitle(this.sidePanel, "Entities");
				this.entityList.setEntities(layer.entities);
				this.entityList.show();
				layer.debugCallback = () => this.entityList.updateEntities(layer.entities, entityId);
			};
			const findEntityById = (entityId) => layer.get(entityId);
			let entityId = "";

			showEntityListInspector();

			this.entityList.addEventListener("entity-selected", (event) => {
				const customEvent = event as CustomEvent;
				entityId = customEvent.detail?.entityId;
				if (entityId) layer.selectEntity(entityId);
			});

			this.entityList.addEventListener("inspect-entity", (event) => {
				const customEvent = event as CustomEvent;
				const entityId = customEvent.detail?.entityId;
				if (entityId && this.entityInspector) {
					const selectedEntity = findEntityById(entityId);
					if (selectedEntity) {
						this.entityInspector.show();
						this.entityList.hide();

						layer.debugCallback = () => {
							this.entityInspector.update(selectedEntity as unknown as Record<string, unknown>);
						};

						pageHistory.push(() => {
							this.entityInspector.hide();
							showEntityListInspector();
						});

						setPanelTitle(this.sidePanel, `${selectedEntity.class} ${selectedEntity.id}`);

						layer.selectEntity(entityId);
					} else {
						layer.selectEntity(-1);
					}
				}
			});

			this.entityInspector.addEventListener("property-changed", (event) => {
				const customEvent = event as CustomEvent;
				const key = customEvent.detail?.key as string;
				const value = customEvent.detail?.value;
				const selectedEntity = findEntityById(entityId);
				if (selectedEntity) {
					selectedEntity[key] = value;
				}
			});

			this.sidePanel.addEventListener("sidepanel-closed", () => {
				this.entityInspector.hide();
				showEntityListInspector();
				pageHistory.length = 0;
				triggerBtn.style.visibility = "visible";
				layer.debugCallback = undefined;
				layer.selectEntity(-1);
			});
		});
	}
}

export function enableDebugInspectors(coppola: Director) {
	new DebugManager(coppola);
}

export function enableDebug(state: boolean) {
	const btn = document.getElementById(GAMER2D_DEBUG);
	if (btn) btn.style.visibility = state ? "" : "hidden";
}

// :hover -> rgb(85 171 247 / 58%)
