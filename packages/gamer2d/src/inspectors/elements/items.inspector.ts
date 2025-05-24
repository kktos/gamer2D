import type { Entity } from "../../entities/Entity";

export class EntityList extends HTMLElement {
	private _table: HTMLTableElement;
	private _tbody: HTMLTableSectionElement;
	private _colgroup: HTMLTableColElement[];
	private _entityRowMap = new Map<string, HTMLTableRowElement>();
	private headers = ["Class", "ID", "Left", "Top"];
	private _colWidths = [120, 80, 60, 60]; // px, initial widths
	private _resizingCol = -1;
	private _startX = 0;
	private _startWidth = 0;

	static bootstrap() {
		if (!customElements.get("items-inspector")) customElements.define("items-inspector", EntityList);
	}

	constructor() {
		super();
		const shadow = this.attachShadow({ mode: "open" });
		shadow.appendChild(createTemplate());

		this._table = shadow.querySelector("table") as HTMLTableElement;
		this._tbody = shadow.querySelector("tbody") as HTMLTableSectionElement;
		const colgroup = shadow.querySelector("colgroup");
		this._colgroup = [];

		// Build colgroup for resizing
		for (let i = 0; i < this.headers.length; i++) {
			const col = document.createElement("col");
			col.style.width = `${this._colWidths[i]}px`;
			colgroup?.appendChild(col);
			this._colgroup.push(col);
		}

		// Build header
		const headerRow = shadow.querySelector("thead tr");
		if (headerRow)
			for (let i = 0; i < this.headers.length; i++) {
				const th = document.createElement("th");
				th.textContent = this.headers[i];
				if (i < this.headers.length - 1) {
					const grip = document.createElement("div");
					grip.className = "resize-grip";
					grip.addEventListener("mousedown", (e) => this._startResize(e, i));
					th.appendChild(grip);
				}
				headerRow.appendChild(th);
			}

		this._table.addEventListener("click", (event) => {
			const row = (event.target as HTMLElement).closest("tr[data-entity-id]") as HTMLTableRowElement;
			if (row) {
				row.dataset.entityId && this.selectRow(row.dataset.entityId);
				this.dispatchEvent(
					new CustomEvent("entity-selected", {
						detail: { entityId: row.dataset.entityId },
						bubbles: true,
						composed: true,
					}),
				);
			}
		});
		this._table.addEventListener("dblclick", (event) => {
			const row = (event.target as HTMLElement).closest("tr[data-entity-id]") as HTMLTableRowElement;
			if (row) {
				this.dispatchEvent(
					new CustomEvent("inspect-entity", {
						detail: { entityId: row.dataset.entityId },
						bubbles: true,
						composed: true,
					}),
				);
			}
		});
	}

	/** Call once to build the initial table */
	setEntities(entities: Entity[] | null, selectedEntityId?: string) {
		this._tbody.innerHTML = "";
		this._entityRowMap.clear();

		if (!entities || entities.length === 0) {
			const tr = document.createElement("tr");
			tr.className = "empty-row";
			const td = document.createElement("td");
			td.colSpan = this.headers.length;
			td.textContent = "No entities in layer.";
			tr.appendChild(td);
			this._tbody.appendChild(tr);
			return;
		}

		for (const entity of entities) {
			const tr = this._createRow(entity, selectedEntityId);
			this._tbody.appendChild(tr);
			this._entityRowMap.set(entity.id, tr);
		}
	}

	/** Call repeatedly to update only values, not structure */
	updateEntities(entities: Entity[] | null, selectedEntityId?: string) {
		const newIds = new Set(entities?.map((e) => e.id));

		// Remove rows for entities that no longer exist
		for (const [id, row] of this._entityRowMap) {
			if (!newIds.has(id)) {
				this._tbody.removeChild(row);
				this._entityRowMap.delete(id);
			}
		}

		// Update existing rows and add new ones
		for (const entity of entities ?? []) {
			let row = this._entityRowMap.get(entity.id);
			const values = [entity.class, entity.id, entity.bbox.left.toFixed(), entity.bbox.top.toFixed()];
			if (row) {
				const cells = row.querySelectorAll("td");
				for (let i = 0; i < values.length; i++) {
					if (cells[i] && cells[i].textContent !== values[i]) cells[i].textContent = values[i];
				}
				if (selectedEntityId && entity.id === selectedEntityId) row.classList.add("selected");
				else row.classList.remove("selected");
			} else {
				row = this._createRow(entity, selectedEntityId);
				this._tbody.appendChild(row);
				this._entityRowMap.set(entity.id, row);
			}
		}
	}

	private _createRow(entity: Entity, selectedEntityId?: string): HTMLTableRowElement {
		const tr = document.createElement("tr");
		tr.dataset.entityId = entity.id;
		const values = [entity.class, entity.id, entity.bbox.left.toFixed(), entity.bbox.top.toFixed()];
		for (const val of values) {
			const td = document.createElement("td");
			td.textContent = val;
			tr.appendChild(td);
		}

		if (selectedEntityId && entity.id === selectedEntityId) tr.classList.add("selected");

		return tr;
	}

	selectRow(entityId: string) {
		for (const row of this._entityRowMap.values()) {
			row.classList.toggle("selected", row.dataset.entityId === entityId);
		}
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
		this._entityRowMap.clear();
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
