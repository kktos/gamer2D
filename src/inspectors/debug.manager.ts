import type { Entity } from "../entities/Entity";
import Font from "../game/Font";
import { SpriteSheet } from "../game/Spritesheet";
import type { EntitiesLayer } from "../layers/entities.layer";
import type Director from "../scene/Director";
import { EntityListPanel } from "./entities.inspector";
import { EntityInspector } from "./entity.inspector";

export function enableDebugInspectors(coppola: Director) {
	EntityInspector.bootstrap();
	EntityListPanel.bootstrap();
	setupHTMLAndEventListeners(coppola);
}

export function displayDebugInspectors(coppola: Director) {
	const entityListInspector = document.getElementById("entity-list") as EntityListPanel;
	const entityInspector = document.getElementById("inspector") as EntityInspector;

	let findEntityById: (entityId) => Entity | undefined;
	let showEntityListInspector: () => void;

	coppola.currentScene.useLayer("EntitiesLayer", (layer: EntitiesLayer) => {
		showEntityListInspector = () => entityListInspector.show(layer.entities);
		findEntityById = (entityId) => layer.get(entityId);
		showEntityListInspector();

		entityListInspector.addEventListener("entity-selected", (event) => {
			const customEvent = event as CustomEvent;
			const entityId = customEvent.detail?.entityId;
			if (entityId && entityInspector) {
				const selectedEntity = findEntityById(entityId);
				if (selectedEntity) {
					// Prepare properties to show (optional filtering)
					const propertiesToShow = prepareEntityProperties(selectedEntity);
					entityInspector.show(propertiesToShow);
					entityListInspector.hide();

					layer.selectEntity(entityId);
				} else {
					entityInspector.hide();
					layer.selectEntity(-1);
				}
			}
		});

		entityInspector.addEventListener("entityInspector-closed", () => showEntityListInspector?.());
	});
}

// --- Helper function to prepare properties (reuse or adapt from previous example) ---
function prepareEntityProperties(entity: Entity): Record<string, unknown> {
	const propertiesToShow: Record<string, unknown> = {};
	for (const key in entity) {
		if (typeof entity[key] === "function") continue;
		if (entity[key] instanceof SpriteSheet) {
			propertiesToShow[key] = `#${entity[key].sprites.size} sprites`;
			continue;
		}
		if (entity[key] instanceof Font) {
			propertiesToShow[key] = `${entity[key].name}`;
			continue;
		}
		propertiesToShow[key] = entity[key];
	}
	// Add specific properties if needed, e.g., from traits
	// if (entity.traits) {
	// 	propertiesToShow["traits"] = Array.from(entity.traits.keys());
	// }
	// ... add more specific details as needed ...
	return propertiesToShow;
}

function setupHTMLAndEventListeners(coppola: Director) {
	const trigger = createTrigger();
	createEntityInspector();
	createEntitiesInspector();
	trigger.addEventListener("click", () => displayDebugInspectors(coppola));
}

function createTrigger() {
	const trigger = document.createElement("div");
	trigger.id = "debug";
	trigger.style.cssText = `
		position: fixed;
		bottom: 4px;
		right: 4px;
		height: 35px;
		width: 35px;
		background-color: rgb(10 118 211 / 58%);
		cursor: pointer;
		display: grid;
		place-items: center;
		color: white;
		border-radius: 50%;
	`;
	document.body.append(trigger);
	return trigger;
}
// :hover -> rgb(85 171 247 / 58%)
function createEntityInspector() {
	const inspector = document.createElement("entity-inspector");
	inspector.id = "inspector";
	document.body.append(inspector);
}

function createEntitiesInspector() {
	const inspector = document.createElement("entity-list-panel");
	inspector.id = "entity-list";
	document.body.append(inspector);
}
