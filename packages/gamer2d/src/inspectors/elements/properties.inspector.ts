const DEBOUNCE_DELAY = 300;

export class PropertiesInspector extends HTMLElement {
	private _shadowRoot: ShadowRoot;
	private _contentElement: HTMLElement | null = null;
	private _filterInputElement: HTMLInputElement | null = null;
	private _clearFilterButtonElement: HTMLButtonElement | null = null;

	private _table: HTMLTableElement | null = null;
	private _rowMap = new Map<string, HTMLTableRowElement>();
	private _lastProcessedObject: unknown;
	private _debounceTimer: ReturnType<typeof setTimeout> | undefined;

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

		// Ensure keys are strings for filtering and map storage
		const allEntries: [string, unknown][] = rawEntries.map(([key, value]) => [String(key), value]);

		let filteredEntries = allEntries;
		if (filterText.length > 0) {
			filteredEntries = allEntries.filter(([key, value]) => {
				if (this.filterPredicate) return this.filterPredicate(key, value, filterText);
				// Default filter logic
				const comparableValue = this._getComparableValue(value).toLowerCase();
				return key.toLowerCase().includes(filterText) || comparableValue.includes(filterText);
			});
		}

		// Clear previous table content
		this._contentElement.innerHTML = "";
		this._rowMap.clear();
		this._table = null;

		if (filteredEntries.length === 0) {
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
        </style>
        <div class="filter-container">
            <input type="text" id="filterInput" placeholder="Filter properties..." autocomplete="off">
            <button type="button" id="clearFilterBtn" class="clear-filter-button" aria-label="Clear filter">&times;</button>
        </div>
        <div id="content">No object selected.</div>
`;
	return template.content.cloneNode(true);
}
