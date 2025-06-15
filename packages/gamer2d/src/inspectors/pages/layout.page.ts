import type { UiLayer } from "../../layers/ui.layer";
import type { Director } from "../../scene/Director";
import type { TStatement } from "../../script/compiler/layers/display/layout/layout.rules";
import { OP_TYPES, OP_TYPES_STR } from "../../types/operation.types";
import type { ItemList, TableColumn } from "../elements/items.inspector";
import { DebugPage } from "./debug-page.class";
import type { PageKey } from "./pages-definitions";

const columns: TableColumn<TStatement>[] = [
	{ key: "type", label: "Type", width: 50, render: (item) => OP_TYPES_STR[item.type] },
	{ key: "type", label: "Value", width: 180, render: renderParam1 },
];

function renderParam1(item: TStatement) {
	switch (item.type) {
		case OP_TYPES.TEXT:
			return item.text;
		case OP_TYPES.SET:
			return `${item.name}= ${item.value}`;
		case OP_TYPES.SPRITE:
			return `${item.name} at:${item.pos[0]},${item.pos[1]}`;
		case OP_TYPES.ANIM:
			return item.name;
		case OP_TYPES.IMAGE:
			return `${item.name} at:${item.pos[0]},${item.pos[1]}`;
		case OP_TYPES.RECT: {
			let stroke = "";
			let fill = "";
			if (item.color) {
				stroke = `border:1px solid ${item.color.value};`;
			}
			if (item.fill) {
				fill = `background:${item.fill.value};`;
			}
			return `<div style="display:flex;align-items:center">
				<div style="flex:1">at:${item.pos[0]},${item.pos[1]} w:${item.width} h:${item.height}</div>
				<div style="height:20px;aspect-ratio:1;${stroke}${fill}"><div>
			<div>`;
		}
		case OP_TYPES.MENU:
			return `${item.items.length} items`;
	}
	return "???";
}

export class LayoutPage extends DebugPage {
	private element!: ItemList<TStatement>;
	private layer!: UiLayer;

	constructor(
		public coppola: Director,
		public title: string,
		private params: { data },
	) {
		super(coppola, title);
	}

	render(): HTMLElement {
		this.element = document.createElement("items-inspector") as ItemList<TStatement>;
		return this.element;
	}

	open() {
		const varsInspector = this.element;
		const layout: TStatement[] = this.params.data;
		this.coppola.currentScene.useLayer("display", (layer: UiLayer) => {
			this.layer = layer;

			varsInspector.setColumns(columns, (item) => String(layout.findIndex((i) => i === item)));
			varsInspector.setItems(layout);

			// layer.debugCallback = () => varsInspector.update(props);
			varsInspector.addEventListener("inspect-item", (event) => {
				const customEvent = event as CustomEvent;
				const itemId = customEvent.detail?.id;
				if (itemId) {
					varsInspector.dispatchEvent(
						new CustomEvent("goto-page", {
							detail: { id: "layout-item-props" as PageKey, data: layout[itemId] },
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
	}
}
