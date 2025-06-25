import { ArrayEditor } from "./property.editors/array.editor";
import { BooleanEditor } from "./property.editors/boolean.editor";
import type { PropertyConfigMap, PropertyEditor } from "./property.editors/editors.intf";
import { NumberEditor } from "./property.editors/number.editor";
import { PointEditor } from "./property.editors/point.editor";
import { RgbaEditor } from "./property.editors/rgba.editor";
import { SelectEditor } from "./property.editors/select.editor";
import { TextEditor } from "./property.editors/text.editor";
import { VariableEditor } from "./property.editors/variable.editor";

const DEBOUNCE_DELAY = 300;

export class PropertiesInspector extends HTMLElement {
	static editors: PropertyEditor[] = [];
	private _editors: PropertyEditor[] = [];

	private _shadowRoot: ShadowRoot;
	private _contentElement: HTMLElement | null = null;
	private _filterInputElement: HTMLInputElement | null = null;
	private _clearFilterButtonElement: HTMLButtonElement | null = null;

	private _table: HTMLTableElement | null = null;
	private _rowMap = new Map<string, HTMLTableRowElement>();
	private _lastProcessedObject: unknown;
	private _debounceTimer: ReturnType<typeof setTimeout> | undefined;

	public propertyConfigs: PropertyConfigMap = {};
	public evalValue!: (name: string) => unknown;

	public filterPredicate?: (key: string, value: unknown, filterText: string) => boolean;

	static bootstrap() {
		if (!customElements.get("properties-inspector")) customElements.define("properties-inspector", PropertiesInspector);
	}

	constructor() {
		super();
		this._shadowRoot = this.attachShadow({ mode: "open" });
		this._shadowRoot.appendChild(createTemplate());
		this._filterInputElement = this._shadowRoot.getElementById("filterInput") as HTMLInputElement;
		this._clearFilterButtonElement = this._shadowRoot.getElementById("clearFilterBtn") as HTMLButtonElement;
		this._contentElement = this._shadowRoot.getElementById("content");

		if (this._filterInputElement) {
			this._filterInputElement.addEventListener("input", () => {
				clearTimeout(this._debounceTimer);
				this._debounceTimer = setTimeout(() => {
					if (this._lastProcessedObject !== undefined) {
						this.update(this._lastProcessedObject);
					}
				}, DEBOUNCE_DELAY);
				this._updateClearButtonVisibility();
			});
		}

		if (this._clearFilterButtonElement) {
			this._clearFilterButtonElement.addEventListener("click", () => {
				if (this._filterInputElement) {
					this._filterInputElement.value = "";
					// Optionally focus the input after clearing:
					// this._filterInputElement.focus();
				}
				clearTimeout(this._debounceTimer);
				if (this._lastProcessedObject !== undefined) {
					this.update(this._lastProcessedObject);
				}
				this._updateClearButtonVisibility();
			});
		}
		this._updateClearButtonVisibility();
	}

	static registerEditors(editors: PropertyEditor[]) {
		for (const editor of editors) PropertiesInspector.editors.push(editor);
	}

	setEditors(editors: PropertyEditor[]) {
		this._editors = editors;
	}
	public setPropertyConfigs(configs: PropertyConfigMap) {
		this.propertyConfigs = configs;
		if (this._lastProcessedObject !== undefined) {
			// Debounce this update as well if configs can change frequently
			// For simplicity, direct update here.
			this.update(this._lastProcessedObject);
		}
	}

	/**
	 * Displays or updates the properties of the given entity.
	 * @param obj - The entity object whose properties should be displayed.
	 */
	update(obj) {
		if (!this._contentElement || !this._filterInputElement) return;
		this._lastProcessedObject = obj;

		this.style.setProperty("--th-width", Array.isArray(obj) ? "10%" : "35%");

		const filterText = this._filterInputElement.value.trim().toLowerCase();

		let rawEntries: [string | number | symbol, unknown][];
		if (obj instanceof Map) {
			rawEntries = Array.from(obj.entries());
		} else if (Array.isArray(obj)) {
			rawEntries = obj.map((value, index) => [String(index), value]);
		} else if (typeof obj === "object" && obj !== null) {
			rawEntries = Object.entries(obj);
		} else {
			this._contentElement.innerHTML = `<p class="no-results">Cannot inspect non-object: ${String(obj)}.</p>`;
			this._table = null;
			this._rowMap.clear();
			return;
		}

		const allEntries: [string, unknown][] = rawEntries.map(([key, value]) => [String(key), value]);

		let filteredEntries = allEntries;
		if (filterText.length > 0) {
			filteredEntries = allEntries.filter(([key, value]) => {
				if (this.filterPredicate) return this.filterPredicate(key, value, filterText);
				const comparableValue = this._getComparableValue(value).toLowerCase();
				return key.toLowerCase().includes(filterText) || comparableValue.includes(filterText);
			});
		}

		// If no properties, show message
		if (filteredEntries.length === 0) {
			this._contentElement.innerHTML = "";
			this._rowMap.clear();
			this._table = null;
			const noResultsMsg = document.createElement("p");
			noResultsMsg.className = "no-results";
			noResultsMsg.textContent = filterText
				? "No properties match your filter."
				: allEntries.length === 0
					? "No properties to display."
					: "No properties match your filter.";
			this._contentElement.appendChild(noResultsMsg);
			return;
		}

		// If table doesn't exist or keys have changed, rebuild
		const currentKeys = Array.from(this._rowMap.keys());
		const newKeys = filteredEntries.map(([key]) => key);
		const keysChanged = currentKeys.length !== newKeys.length || currentKeys.some((k, i) => k !== newKeys[i]);

		if (!this._table || keysChanged) this._buildTable(filteredEntries);
		else this._updateValues(filteredEntries);
	}

	private _buildTable(filteredEntries: [string, unknown][]) {
		if (!this._contentElement) return;

		this._contentElement.innerHTML = "";
		this._rowMap.clear();
		this._table = document.createElement("table");
		const tbody = document.createElement("tbody");
		this._table.appendChild(tbody);
		this._contentElement.appendChild(this._table);

		for (const [key, value] of filteredEntries) {
			const row = this._createRow(key, value);
			tbody.appendChild(row);
			this._rowMap.set(key, row);
		}
	}

	private _updateValues(filteredEntries: [string, unknown][]) {
		for (const [key, value] of filteredEntries) {
			const row = this._rowMap.get(key);
			if (row) {
				const valueCell = row.cells[1];
				this._setValueCell(valueCell, value, key);
			}
		}
	}

	private _getComparableValue(value: unknown): string {
		if (value === null) return "null";
		if (value === undefined) return "undefined";
		if (typeof value === "string") return value;
		if (typeof value === "number" || typeof value === "boolean") return String(value);
		if (Array.isArray(value)) return value.map((v) => this._getComparableValue(v)).join(" ");
		if (typeof value === "object") {
			if (Symbol.for("inspect") in value) {
				const inspected = value[Symbol.for("inspect")];
				if (typeof inspected === "string") return inspected;
				// If inspect() returns an element, we can't easily stringify it for filter
				if (inspected instanceof HTMLElement) return `[HTMLElement ${inspected.tagName}]`;
			}
			if (value instanceof HTMLElement) return `[HTMLElement ${value.tagName}]`;
			try {
				return JSON.stringify(value); // Simple stringify, might be too verbose or fail on circular
			} catch {
				return "[object]";
			}
		}
		if (typeof value === "function") return "Function";
		return String(value);
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

	private _setValueCell(cell: HTMLTableCellElement, value: unknown, key?: string) {
		const config = key ? this.propertyConfigs?.[key] : undefined;
		const editors = this._editors.length ? this._editors : PropertiesInspector.editors;

		if (key && config?.editor) {
			const editor = editors.find((e) => e.supports(config, value));
			if (editor) {
				editor.render(cell, key, value, config, this);
				return;
			}
		}

		cell.innerHTML = "";

		// --- Custom renderer support ---
		if (config?.renderer && key) {
			const rendered = config.renderer(value, key, config);
			if (typeof rendered === "string") cell.innerHTML = rendered;
			else if (rendered instanceof HTMLElement) cell.appendChild(rendered);
			return;
		}

		// --- Non-editable display logic (adapted from your original) ---
		if (Array.isArray(value)) {
			const ul = document.createElement("ul");
			for (const item of value) {
				const li = document.createElement("li");
				li.textContent = this._formatDisplayValue(item);
				ul.appendChild(li);
			}
			cell.appendChild(ul);
			return;
		}
		if (typeof value === "object" && value !== null) {
			if (Symbol.for("inspect") in value) {
				const inspectedData = value[Symbol.for("inspect")];
				if (inspectedData instanceof HTMLElement) {
					cell.appendChild(inspectedData);
					return;
				}
				cell.textContent = this._formatDisplayValue(inspectedData);
				return;
			}
			if (value instanceof HTMLElement) {
				cell.appendChild(value);
				return;
			}
		}

		cell.textContent = this._formatDisplayValue(value);
	}

	private _formatDisplayValue(value: unknown): string {
		switch (typeof value) {
			case "undefined":
				return "";
			case "string":
				return `"${value}"`;
			case "number":
			case "boolean":
				return String(value);
			case "object":
				if (value === null) return "null";
				if (value instanceof HTMLElement) return value.tagName;
				if (Symbol.for("inspect") in value) {
				}
				try {
					return JSON.stringify(value, null, 2);
				} catch (_e) {
					return "[Circular Structure]";
				}
			case "function":
				return "Function()";
			default:
				return String(value);
		}
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
		this._lastProcessedObject = undefined;
		if (this._filterInputElement) this._filterInputElement.value = "";
		this._updateClearButtonVisibility();
	}

	private _updateClearButtonVisibility(): void {
		if (this._clearFilterButtonElement && this._filterInputElement) {
			const hasText = this._filterInputElement.value.length > 0;
			this._clearFilterButtonElement.style.display = hasText ? "inline-block" : "none";
		}
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

				--th-width: 35%;
				--inspector-empty-color: #999;
            }
			.filter-container {
				display: flex; /* For aligning input and button */
                align-items: center; /* Vertically align items */
                padding: 8px;
                background-color: rgb(0 0 0 / 15%);
                border-bottom: 1px solid rgb(255 255 255 / 20%);
                position: relative; /* For absolute positioning of clear button if needed, though flex is used here */
            }
            #filterInput {
                flex-grow: 1; /* Input takes available space */
                padding: 6px 8px;
                border: 1px solid rgb(255 255 255 / 30%);
                border-radius: 4px;
                background-color: rgb(255 255 255 / 10%);
                color: white;
                font-size: 13px;
            }
            #filterInput::placeholder {
                color: #aaa;
            }
			.clear-filter-button {
                background: none;
                border: none;
                color: #ccc;
                font-size: 20px; /* Adjust for better visibility */
                line-height: 1;
                cursor: pointer;
                padding: 0 6px; /* Give it some clickable area */
                margin-left: 6px; /* Space between input and button */
            }
            .clear-filter-button:hover {
                color: white;
            }
            #content {
                overflow-y: auto;
                background-color: rgb(0 0 0 / 50%);
            }
			.no-results {
                text-align: center;
                padding: 10px;
                color: var(--inspector-empty-color);
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
                width: var(--th-width);
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
            /* Basic styling for inputs inside cells */
            td input, td select {
                box-sizing: border-box; /* So padding/border don't increase width */
                /* Add more specific styling as needed */
            }
			.variable {
				display : flex;
			}
			.rgba-editor { display: flex; align-items: center; gap: 8px; }
			.color-preview { width: 24px; height: 24px; border: 1px solid #888; border-radius: 4px; }				
        </style>
        <div class="filter-container">
            <input type="text" id="filterInput" placeholder="Filter properties..." autocomplete="off">
            <button type="button" id="clearFilterBtn" class="clear-filter-button" aria-label="Clear filter">&times;</button>
        </div>
        <div id="content">No object selected.</div>
`;
	return template.content.cloneNode(true);
}

PropertiesInspector.registerEditors([NumberEditor, TextEditor, BooleanEditor, SelectEditor, RgbaEditor, VariableEditor, PointEditor, ArrayEditor]);
