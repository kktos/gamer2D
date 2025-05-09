import type { Entity } from "../entities/Entity";

export class EntityListPanel extends HTMLElement {
	private _shadowRoot: ShadowRoot;
	private _contentElement: HTMLElement | null = null;
	private _closeButton: HTMLElement | null = null;
	private _listElement: HTMLElement | null = null;

	static bootstrap() {
		if (!customElements.get("entity-list-panel")) customElements.define("entity-list-panel", EntityListPanel);
	}

	constructor() {
		super();
		this._shadowRoot = this.attachShadow({ mode: "open" });

		const template = document.createElement("template");
		template.innerHTML = `
			<style>
				:host {
					display: none;
					position: fixed;
					top: 0;
					right: 0;
					bottom: 0;
					width: 300px; /* Adjust width */
					z-index: 999; /* Slightly lower than inspector */
					font-family: sans-serif;
					font-size: 14px;
					color: #333;
				}
				#panel {
					display: flex;
					flex-direction: column;
					height: 100%;
					background-color: rgb(255 255 255 / 50%);
					color: white;
					box-shadow: 2px 0 5px rgba(0,0,0,0.1);
				}
				#header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding: 10px;
					background-color: rgb(16 122 245 / 70%);
				}
				#header h3 {
					margin: 0;
					font-size: 16px;
				}
				#close-btn {
					background: none;
					border: none;
					font-size: 20px;
					cursor: pointer;
					padding: 0 5px;
					color: white;
				}
				#content {
					flex-grow: 1;
					padding: 0; /* Remove padding for list */
					overflow-y: auto;
					background-color: rgb(0 0 0 / 50%);
				}
				#entity-list {
					list-style: none;
					padding: 0;
					margin: 0;
				}
				#entity-list li {
					padding: 8px 12px;
					border-bottom: 1px solid rgb(255 255 255 / 38%);
					cursor: pointer;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}
				#entity-list li:hover {
					background-color: rgb(32 108 173 / 50%);
				}
				#entity-list li.selected {
					background-color: rgb(58 164 255 / 50%);
					font-weight: bold;
				}
			</style>
			<div id="panel">
				<div id="header">
					<h3>Entity List</h3>
					<button id="close-btn" title="Close">&times;</button>
				</div>
				<div id="content">
					<ul id="entity-list"></ul>
				</div>
			</div>
		`;

		this._shadowRoot.appendChild(template.content.cloneNode(true));

		this._contentElement = this._shadowRoot.getElementById("content");
		this._closeButton = this._shadowRoot.getElementById("close-btn");
		this._listElement = this._shadowRoot.getElementById("entity-list");

		this._closeButton?.addEventListener("click", () => this.hide());

		// Event delegation for clicks on list items
		this._listElement?.addEventListener("click", (event) => {
			const target = event.target as HTMLElement;
			if (target?.matches("li[data-entity-id]")) {
				const entityId = target.dataset.entityId;
				if (entityId) {
					// Remove previous selection highlight
					this._listElement?.querySelector("li.selected")?.classList.remove("selected");
					// Add highlight to clicked item
					target.classList.add("selected");

					// Dispatch a custom event with the entity ID
					this.dispatchEvent(
						new CustomEvent("entity-selected", {
							detail: { entityId },
							bubbles: true, // Allows the event to bubble up the DOM
							composed: true, // Allows the event to cross shadow DOM boundaries
						}),
					);
				}
			}
		});
	}

	/**
	 * Displays the panel and populates the list with entities.
	 * @param entities - An array of entity objects.
	 * @param selectedEntityId - Optional ID of the currently selected entity for highlighting.
	 */
	show(entities: Entity[] | null, selectedEntityId?: string) {
		if (!this._listElement) return;

		// Clear previous list
		this._listElement.innerHTML = "";

		if (!entities || entities.length === 0) {
			const li = document.createElement("li");
			li.textContent = "No entities in layer.";
			li.style.cursor = "default";
			this._listElement.appendChild(li);
		} else {
			for (const entity of entities) {
				const li = document.createElement("li");
				// li.textContent = `${entity.class} ${entity.id}`;
				li.innerHTML = `${entity.class} ${entity.id} [${entity.bbox.left},${entity.bbox.top}]`;
				// li.title = `ID: ${entity.id}`;
				li.dataset.entityId = entity.id; // Store ID for click events

				if (entity.id === selectedEntityId) li.classList.add("selected");

				this._listElement?.appendChild(li);
			}
		}

		this.style.display = "block";
	}

	hide() {
		this.style.display = "none";
		// Optional: Clear selection highlight when hiding
		this._listElement?.querySelector("li.selected")?.classList.remove("selected");
	}

	clear() {
		if (this._listElement) this._listElement.innerHTML = "";
	}

	connectedCallback() {
		console.log("Entity List Panel added to page.");
	}

	disconnectedCallback() {
		console.log("Entity List Panel removed from page.");
	}
}
