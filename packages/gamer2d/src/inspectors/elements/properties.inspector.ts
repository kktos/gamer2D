export class PropertiesInspector extends HTMLElement {
	private _shadowRoot: ShadowRoot;
	private _contentElement: HTMLElement | null = null;
	private _table: HTMLTableElement | null = null;
	private _rowMap = new Map<string, HTMLTableRowElement>();

	static bootstrap() {
		if (!customElements.get("properties-inspector")) customElements.define("properties-inspector", PropertiesInspector);
	}

	constructor() {
		super();
		this._shadowRoot = this.attachShadow({ mode: "open" });
		this._shadowRoot.appendChild(createTemplate());
		this._contentElement = this._shadowRoot.getElementById("content");
	}

	/**
	 * Displays or updates the properties of the given entity.
	 * @param obj - The entity object whose properties should be displayed.
	 */
	update(obj) {
		if (!this._contentElement) return;

		const keys = new Set(obj instanceof Map ? Array.from(obj.keys()) : Object.keys(obj));
		const entries = obj instanceof Map ? Array.from(obj.entries()) : Object.entries(obj);

		// If table doesn't exist, create it and all rows
		if (!this._table) {
			this._table = document.createElement("table");
			const tbody = document.createElement("tbody");
			this._table.appendChild(tbody);
			this._contentElement.innerHTML = "";
			this._contentElement.appendChild(this._table);
			this._rowMap.clear();

			// for (const [key, value] of Object.entries(obj)) {
			for (const [key, value] of entries) {
				const row = this._createRow(key, value);
				tbody.appendChild(row);
				this._rowMap.set(key, row);
			}
			return;
		}

		// Update or add/remove rows as needed
		const tbody = this._table.tBodies[0];
		// const keys = new Set(Object.keys(obj));
		// Remove rows for keys no longer present
		for (const key of Array.from(this._rowMap.keys())) {
			if (!keys.has(key)) {
				const row = this._rowMap.get(key);
				row && tbody.removeChild(row);
				this._rowMap.delete(key);
			}
		}
		// Update existing rows and add new ones
		// for (const [key, value] of Object.entries(obj)) {
		for (const [key, value] of entries) {
			let row = this._rowMap.get(key);
			if (row) {
				this._updateRow(row, value);
				continue;
			}
			row = this._createRow(key, value);
			tbody.appendChild(row);
			this._rowMap.set(key, row);
		}
	}

	private _createRow(key: string, value: unknown): HTMLTableRowElement {
		const row = document.createElement("tr");
		const keyCell = document.createElement("th");
		keyCell.textContent = key;
		const valueCell = document.createElement("td");
		this._setValueCell(valueCell, value, key);
		row.appendChild(keyCell);
		row.appendChild(valueCell);
		return row;
	}

	private _updateRow(row: HTMLTableRowElement, value: unknown) {
		const valueCell = row.cells[1];
		this._setValueCell(valueCell, value, row.cells[0].textContent ?? undefined);
	}

	private _setValueCell(cell: HTMLTableCellElement, value: unknown, key?: string) {
		if (typeof value === "number") {
			let input = cell.firstElementChild as HTMLInputElement;
			if (!input) {
				input = document.createElement("input");
				input.type = "number";
				input.style.width = "100%";
				input.addEventListener("change", () => {
					const newValue = Number(input.value);
					this.dispatchEvent(
						new CustomEvent("property-changed", {
							detail: { key, value: newValue },
							bubbles: true,
							composed: true,
						}),
					);
				});
				cell.appendChild(input);
			}
			if (this._shadowRoot.activeElement !== input && value !== input.valueAsNumber) input.valueAsNumber = value;
			return;
		}

		if (Array.isArray(value)) {
			cell.innerHTML = `<ul><li>${value.join("</li><li>")}</li></ul>`;
			return;
		}

		let displayValue: string;
		switch (typeof value) {
			case "object":
				if (!value) {
					displayValue = "null";
					break;
				}
				if (Symbol.for("inspect") in value) {
					const data = value[Symbol.for("inspect")]();
					if (data instanceof HTMLElement) {
						cell.appendChild(data);
						return;
					}
					cell.textContent = data;
					return;
				}
				if (value instanceof HTMLElement) {
					cell.appendChild(value);
					return;
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
				displayValue = "";
				break;
			default:
				displayValue = String(value);
				break;
		}
		cell.textContent = displayValue;
	}

	show() {
		if (this._contentElement) this._contentElement.style.display = "block";
	}
	hide() {
		if (this._contentElement) this._contentElement.style.display = "none";
	}

	clear() {
		if (this._contentElement) this._contentElement.innerHTML = "";
		this._table = null;
		this._rowMap.clear();
	}
}

function createTemplate() {
	const template = document.createElement("template");
	template.innerHTML = `
        <style>
            :host {
                display: block;
                font-family: sans-serif;
                font-size: 14px;
                color: #333;
            }
            #content {
                overflow-y: auto;
                background-color: rgb(0 0 0 / 50%);
            }
            table {
                width: 100%;
                border-collapse: collapse;
                font-size: 14px;
                color: white;
            }
            th, td {
                border-block: 1px solid rgb(255 255 255 / 38%);
                padding: 6px;
                vertical-align: top;
                word-break: break-word;
                }
            td {
                text-align: left;
            }
            th {
                text-align: right;
                background-color: rgb(248 248 248 / 38%);
                width: 35%;
                font-weight: normal;
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
        <div id="content"></div>
    `;
	return template.content.cloneNode(true);
}
