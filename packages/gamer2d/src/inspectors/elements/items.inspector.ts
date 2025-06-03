export interface TableColumn<T = unknown> {
	key: keyof T;
	label: string;
	width?: number;
	render?: (item: T) => string; // custom cell renderer (returns HTML string)
}

export class ItemList<T = unknown> extends HTMLElement {
	private _table: HTMLTableElement;
	private _tbody: HTMLTableSectionElement;
	private _colgroup: HTMLTableColElement[];
	private _rowMap = new Map<string, HTMLTableRowElement>();
	private _columns: TableColumn<T>[] = [];
	private _colWidths: number[] = [];
	private _resizingCol = -1;
	private _startX = 0;
	private _startWidth = 0;
	private _getRowId!: (item: T) => string;

	static bootstrap() {
		if (!customElements.get("items-inspector")) customElements.define("items-inspector", ItemList);
	}

	constructor() {
		super();
		const shadow = this.attachShadow({ mode: "open" });
		shadow.appendChild(createTemplate());

		this._table = shadow.querySelector("table") as HTMLTableElement;
		this._tbody = shadow.querySelector("tbody") as HTMLTableSectionElement;
		this._colgroup = [];

		this._table.addEventListener("click", (event) => {
			const row = (event.target as HTMLElement).closest("tr[data-row-id]") as HTMLTableRowElement;
			if (row) {
				row.dataset.rowId && this.selectRow(row.dataset.rowId);
				this.dispatchEvent(
					new CustomEvent("item-selected", {
						detail: { id: row.dataset.rowId },
						bubbles: true,
						composed: true,
					}),
				);
			}
		});
		this._table.addEventListener("dblclick", (event) => {
			const row = (event.target as HTMLElement).closest("tr[data-row-id]") as HTMLTableRowElement;
			if (row) {
				this.dispatchEvent(
					new CustomEvent("inspect-item", {
						detail: { id: row.dataset.rowId },
						bubbles: true,
						composed: true,
					}),
				);
			}
		});
	}

	/**
	 * Configure the columns and row id getter.
	 * Call this before setItems.
	 */
	setColumns(columns: TableColumn<T>[], getRowId: (item: T) => string) {
		this._columns = columns;
		this._colWidths = columns.map((col) => col.width ?? 100);
		this._getRowId = getRowId;

		// Build colgroup for resizing
		const colgroup = this._table.querySelector("colgroup");
		if (colgroup) {
			colgroup.innerHTML = "";
			this._colgroup = [];
			for (let i = 0; i < this._columns.length; i++) {
				const col = document.createElement("col");
				col.style.width = `${this._colWidths[i]}px`;
				colgroup.appendChild(col);
				this._colgroup.push(col);
			}
		}

		// Build header
		const headerRow = this._table.querySelector("thead tr");
		if (headerRow) {
			headerRow.innerHTML = "";
			for (let i = 0; i < this._columns.length; i++) {
				const th = document.createElement("th");
				th.textContent = this._columns[i].label;
				if (i < this._columns.length - 1) {
					const grip = document.createElement("div");
					grip.className = "resize-grip";
					grip.addEventListener("mousedown", (e) => this._startResize(e, i));
					th.appendChild(grip);
				}
				headerRow.appendChild(th);
			}
		}
	}

	/** Call once to build the initial table */
	setItems(items: T[] | null, selectedRowId?: string) {
		this._tbody.innerHTML = "";
		this._rowMap.clear();

		if (!items || items.length === 0) {
			const tr = document.createElement("tr");
			tr.className = "empty-row";
			const td = document.createElement("td");
			td.colSpan = this._columns.length;
			td.textContent = "No items.";
			tr.appendChild(td);
			this._tbody.appendChild(tr);
			return;
		}

		for (const item of items) {
			const tr = this._createRow(item, selectedRowId);
			this._tbody.appendChild(tr);
			this._rowMap.set(this._getRowId(item), tr);
		}
	}

	/** Call repeatedly to update only values, not structure */
	updateItems(items: T[] | null, selectedRowId?: string) {
		const newIds = new Set(items?.map(this._getRowId));

		// Remove rows for items that no longer exist
		for (const [id, row] of this._rowMap) {
			if (newIds.has(id)) continue;
			this._tbody.removeChild(row);
			this._rowMap.delete(id);
		}

		// Update existing rows and add new ones
		for (const item of items ?? []) {
			const rowId = this._getRowId(item);
			let row = this._rowMap.get(rowId);
			if (row) {
				const cells = row.querySelectorAll("td");
				for (let i = 0; i < this._columns.length; i++) {
					const col = this._columns[i];
					const value = col.render ? col.render(item) : String(item[col.key]);
					if (cells[i] && cells[i].innerHTML !== value) cells[i].innerHTML = value;
				}
				if (selectedRowId && rowId === selectedRowId) row.classList.add("selected");
				else row.classList.remove("selected");
			} else {
				row = this._createRow(item, selectedRowId);
				this._tbody.appendChild(row);
				this._rowMap.set(rowId, row);
			}
		}
	}

	private _createRow(item: T, selectedRowId?: string): HTMLTableRowElement {
		const tr = document.createElement("tr");
		const rowId = this._getRowId(item);
		tr.dataset.rowId = rowId;
		for (const col of this._columns) {
			const td = document.createElement("td");
			td.innerHTML = col.render ? col.render(item) : String(item[col.key]);
			tr.appendChild(td);
		}
		if (selectedRowId && rowId === selectedRowId) tr.classList.add("selected");
		return tr;
	}

	selectRow(rowId: string) {
		for (const row of this._rowMap.values()) row.classList.toggle("selected", row.dataset.rowId === rowId);
	}

	private _startResize(e: MouseEvent, colIdx: number) {
		e.preventDefault();
		this._resizingCol = colIdx;
		this._startX = e.clientX;
		this._startWidth = this._colgroup[colIdx].offsetWidth;
		document.addEventListener("mousemove", this._onResizeMove);
		document.addEventListener("mouseup", this._onResizeEnd);
	}

	private _onResizeMove = (e: MouseEvent) => {
		if (this._resizingCol === -1) return;
		const dx = e.clientX - this._startX;
		const newWidth = Math.max(40, this._startWidth + dx);
		this._colgroup[this._resizingCol].style.width = `${newWidth}px`;
		this._colWidths[this._resizingCol] = newWidth;
	};

	private _onResizeEnd = () => {
		this._resizingCol = -1;
		document.removeEventListener("mousemove", this._onResizeMove);
		document.removeEventListener("mouseup", this._onResizeEnd);
	};

	clear() {
		this._tbody.innerHTML = "";
		this._rowMap.clear();
	}
	show() {
		this.style.display = "block";
	}
	hide() {
		this.style.display = "none";
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
                    color: var(--color, white);
                    user-select: none;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    background: transparent;
                    color: inherit;
                    table-layout: fixed;
                }
                col {
                    width: 100px;
                }
                thead th {
                    background: var(--header-bg-color, #c1c8cf);
                    color: var(--header-color, #2e2c2c);
                    font-weight: bold;
                    padding: 6px 12px;
                    border-bottom: 1px solid #b3d1f7;
                    text-align: left;
                    position: relative;
                }
                tbody td {
                    padding: 6px 12px;
                    border-bottom: 1px solid rgb(255 255 255 / 38%);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                tr.selected {
                    background-color: rgb(58 164 255 / 50%);
                    font-weight: bold;
                }
                tr:hover {
                    background-color: rgb(32 108 173 / 30%);
                }
                .empty-row td {
                    color: #888;
                    text-align: center;
                }
                .resize-grip {
                    position: absolute;
                    top: 0;
                    right: -4px;
                    width: 8px;
                    height: 100%;
                    cursor: col-resize;
                    z-index: 2;
                }
                .resize-grip::after {
                    content: "";
                    display: block;
                    position: absolute;
                    left: 50%;
                    top: 20%;
                    width: 2px;
                    height: 60%;
                    background: #b3b3b3;
                    border-radius: 1px;
                    transform: translateX(-50%);
                    opacity: 0.7;
                    transition: background 0.2s;
                }
                .resize-grip:hover::after {
                    background: #1976d2;
                    opacity: 1;
                }
            </style>
            <table>
                <colgroup></colgroup>
                <thead>
                    <tr></tr>
                </thead>
                <tbody></tbody>
            </table>
        `;
	return template.content.cloneNode(true);
}
