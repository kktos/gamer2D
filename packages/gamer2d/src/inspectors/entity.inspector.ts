export class EntityInspector extends HTMLElement {
	private _shadowRoot: ShadowRoot;
	private _panelElement: HTMLElement | null = null;
	private _contentElement: HTMLElement | null = null;
	private _closeButton: HTMLElement | null = null;

	static bootstrap() {
		if (!customElements.get("entity-inspector")) customElements.define("entity-inspector", EntityInspector);
	}

	constructor() {
		super();
		this._shadowRoot = this.attachShadow({ mode: "open" });

		// Define the HTML structure for the component
		const template = document.createElement("template");
		template.innerHTML = `
			<style>
				:host {
					display: none;
					position: fixed;
					top: 0;
					right: 0;
					bottom: 0;
					width: 300px;
					z-index: 1000; /* Ensure it's on top */
					font-family: sans-serif;
					font-size: 14px;
					color: #333;
				}
				#panel {
					display: flex;
					flex-direction: column;
					height: 100%;
					background-color: rgb(255 255 255 / 50%);
					box-shadow: -2px 0 5px rgba(0,0,0,0.1);
					color: white;
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
					overflow-y: auto;
					background-color: rgb(0 0 0 / 50%);
				}
				table {
					width: 100%;
					border-collapse: collapse;
					font-size: 11px;
					color: white;
				}
				th {
					text-align: right;
				}
				td {
					text-align: left;
				}
				th, td {
					border-block: 1px solid rgb(255 255 255 / 38%);
					padding: 6px;
					vertical-align: top;
					word-break: break-word;
				}
				th {
					background-color: rgb(248 248 248 / 38%);
					width: 35%;
				}
				ul {
					list-style: none;
					margin-block: 0;
					padding: 0;
	            }
				li {
				    border-bottom: 1px solid rgb(255 255 255 / 15%);
				    margin-bottom: 3px;
				}
			</style>
			<div id="panel">
				<div id="header">
					<h3>Entity Inspector</h3>
					<button id="close-btn" title="Close">&times;</button>
				</div>
				<div id="content"></div>
			</div>
		`;

		this._shadowRoot.appendChild(template.content.cloneNode(true));

		// Get references to internal elements
		this._panelElement = this._shadowRoot.getElementById("panel");
		this._contentElement = this._shadowRoot.getElementById("content");
		this._closeButton = this._shadowRoot.getElementById("close-btn");

		// Add event listener for the close button
		this._closeButton?.addEventListener("click", () => this.hide());
	}

	/**
	 * Displays the inspector panel with the properties of the given entity.
	 * @param entity - The entity object whose properties should be displayed.
	 */
	show(entity: Record<string, unknown> | null) {
		if (!this._contentElement) return;

		if (!entity) {
			this._contentElement.innerHTML = "<p>No entity selected.</p>";
			this.style.display = "block";
			return;
		}

		// Clear previous content
		this._contentElement.innerHTML = "";

		// Create a table to display properties
		const table = document.createElement("table");
		const tbody = document.createElement("tbody");

		for (const [key, value] of Object.entries(entity)) {
			const row = tbody.insertRow();

			const keyCell = row.insertCell();
			keyCell.outerHTML = `<th>${key}</th>`;

			const valueCell = row.insertCell();
			let displayValue: string;

			switch (typeof value) {
				case "object":
					if (!value) {
						displayValue = "null";
						break;
					}
					if (Symbol.for("inspect") in value) {
						displayValue = value[Symbol.for("inspect")]();
						break;
					}
					try {
						displayValue = JSON.stringify(value, null, 2);
					} catch (e) {
						displayValue = "[Circular Structure]";
					}

					break;
				case "function":
					displayValue = "Function";
					break;
				case "undefined":
					displayValue = "undefined";
					break;
				default: // Covers string, number, boolean, symbol, bigint
					displayValue = String(value);
					break;
			}

			if (Array.isArray(displayValue)) {
				valueCell.innerHTML = `<ul><li>${displayValue.join("<li>")}</ul>`;
			} else valueCell.textContent = displayValue;
		}

		table.appendChild(tbody);
		this._contentElement.appendChild(table);

		// Make the component visible
		this.style.display = "block";
	}

	/**
	 * Hides the inspector panel.
	 */
	hide() {
		this.style.display = "none";

		this.dispatchEvent(
			new CustomEvent("entityInspector-closed", {
				bubbles: true, // Allows the event to bubble up the DOM
				composed: true, // Allows the event to cross shadow DOM boundaries
			}),
		);

		// Optional: Clear content when hiding
		// if (this._contentElement) {
		//     this._contentElement.innerHTML = '';
		// }
	}

	// Lifecycle callbacks (optional, but good practice)
	connectedCallback() {
		// console.log('Entity Inspector added to page.');
	}

	disconnectedCallback() {
		// console.log('Entity Inspector removed from page.');
		// Clean up event listeners if any were attached to document/window
	}
}

/*
// --- Somewhere in your code where you select an entity ---
function onEntitySelected(selectedEntity: Entity) { // Assuming 'Entity' is your entity type
    if (inspector) {
        // You might want to create a simpler object with just the properties
        // you want to display, or filter out methods/complex objects if needed.
        const propertiesToShow: Record<string, any> = {};
        for (const key in selectedEntity) {
            // Example filtering: avoid functions or very complex objects if desired
            if (typeof selectedEntity[key] !== 'function') {
                 // Be careful with deep objects or circular references
                 // The component tries to handle basic cases
                propertiesToShow[key] = selectedEntity[key];
            }
        }
         // Or just pass the whole entity if you're okay displaying everything
        // inspector.show(selectedEntity);

        inspector.show(propertiesToShow);
    }
}

function onDeselect() {
     if (inspector) {
        inspector.hide();
        // or show a default state: inspector.show(null);
     }
}
*/
