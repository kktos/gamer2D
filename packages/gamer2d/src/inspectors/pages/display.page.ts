import type { Director } from "../../scene/Director";
import type { DebugMenu } from "../elements/debug-menu.element";
import type { DebugMenuItemElement } from "../elements/debug-menu-item.element";
import type { PropertiesInspector } from "../elements/properties.inspector";
import { DebugPage } from "./debug-page.class";

export class DisplayPage extends DebugPage {
	private element!: HTMLElement;

	constructor(
		public coppola: Director,
		public title: string,
		private params: { data },
	) {
		super(coppola, title);
	}

	render(): HTMLElement {
		this.element = document.createElement("div");
		this.element.appendChild(createTemplate());
		return this.element;
	}

	open() {
		const propsInspector = this.element.querySelector("properties-inspector") as PropertiesInspector;
		const menu = this.element.querySelector("debug-menu") as DebugMenu;

		this.coppola.currentScene.useLayer("display", (layer) => {
			const { gc, scene, layout, vars, ...props } = { ...(layer as unknown as Record<string, unknown>) };

			propsInspector.update(props);

			const items = [
				{ id: "layout", title: "Layout", data: layout },
				{ id: "variables", title: "Global Variables", data: (vars as unknown as Record<string, unknown>).globals },
				{ id: "variables", title: "Local Variables", data: (vars as unknown as Record<string, unknown>).locals },
			];
			// biome-ignore lint/complexity/noForEach: <explanation>
			items.forEach((item) => {
				const btn = document.createElement("debug-menu-item") as DebugMenuItemElement;
				menu.appendChild(btn);
				btn.innerText = item.title;
				btn.setAttribute("key", item.id);
				btn.data = item.data;
			});
		});
	}

	close() {}
}

function createTemplate() {
	const template = document.createElement("template");
	template.innerHTML = `
			<properties-inspector></properties-inspector>
			<debug-menu></debug-menu>		
		`;
	return template.content.cloneNode(true) as HTMLElement;
}
