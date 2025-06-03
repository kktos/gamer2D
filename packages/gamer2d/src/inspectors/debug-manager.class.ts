import type { Director } from "../scene/Director";
import { DebugMenuItemElement } from "./elements/debug-menu-item.element";
import { DebugMenu } from "./elements/debug-menu.element";
import { ItemList } from "./elements/items.inspector";
import { PropertiesInspector } from "./elements/properties.inspector";
import { SidePanel } from "./elements/side-panel.element";
import type { DebugPage } from "./pages/debug-page.class";
import { MenuPage } from "./pages/menu-page.class";
import { PAGES } from "./pages/pages-definitions";
import { createSidePanel } from "./utils/createSidePanel.utils";
import { TRIGGER_BTN_ID, createTriggerBtn } from "./utils/createTriggerBtn.util";

const GAMER2D_DEBUG = "gamer2d-debug";

export class DebugManager {
	private pageStack: DebugPage[] = [];
	private sidePanel!: SidePanel;

	constructor(private coppola: Director) {
		SidePanel.bootstrap();
		ItemList.bootstrap();
		PropertiesInspector.bootstrap();
		DebugMenuItemElement.bootstrap();
		DebugMenu.bootstrap();

		// activated per scene
		enableDebug(false);

		this.setup();
	}

	setup() {
		const root = document.createElement("div");
		root.id = GAMER2D_DEBUG;

		const triggerBtn = createTriggerBtn(root);
		root.append(triggerBtn);

		const panel = createSidePanel(root);
		root.append(panel);

		document.body.append(root);

		triggerBtn.addEventListener("click", () => this.show());

		this.sidePanel = document.querySelector(`#${GAMER2D_DEBUG} side-panel`) as SidePanel;

		this.sidePanel.addEventListener("sidepanel-closed", () => {
			triggerBtn.style.visibility = "visible";
		});
		this.sidePanel.addEventListener("go-back", () => this.goBack());
		this.sidePanel.addEventListener("goto-page", (e) => {
			const { id, data, params } = (e as CustomEvent).detail;
			if (!PAGES[id] || !PAGES[id].class) this.goto(PAGES.DEFAULT, { ...params, data });
			else this.goto(PAGES[id], { ...params, data });
		});
		this.sidePanel.addEventListener("menu-item-selected", (e) => {
			const { id, data, params } = (e as CustomEvent).detail;
			if (!PAGES[id] || !PAGES[id].class) this.goto(PAGES.DEFAULT, { ...params, data });
			else this.goto(PAGES[id], { ...params, data });
		});
	}

	show() {
		const triggerBtn = document.querySelector(`#${GAMER2D_DEBUG} #${TRIGGER_BTN_ID}`) as HTMLElement;
		triggerBtn.style.visibility = "hidden";

		this.sidePanel.show();

		const homepage = new MenuPage(this.coppola, "Debugger");
		this.pageStack = [homepage];
		this.render();

		this.sidePanel.addEventListener("sidepanel-closed", () => {
			this.pageStack.at(-1)?.close();
		});

		/*
		this.coppola.currentScene.useLayer("entities", (layer: EntitiesLayer) => {

			this.entityInspector.addEventListener("property-changed", (event) => {
				const customEvent = event as CustomEvent;
				const key = customEvent.detail?.key as string;
				const value = customEvent.detail?.value;
				const selectedEntity = findEntityById(entityId);
				if (selectedEntity) {
					selectedEntity[key] = value;
				}
			});

		});
		*/
	}

	goto(pageDef: { title: string; class }, params: Record<string, unknown>) {
		this.pageStack.at(-1)?.close();
		const page = new pageDef.class(this.coppola, pageDef.title, params);
		this.pageStack.push(page);
		this.render();
	}

	goBack() {
		this.pageStack.at(-1)?.close();

		this.pageStack.pop();
		this.render();
	}

	render() {
		const page = this.pageStack.at(-1);
		if (!page) return;
		this.sidePanel.setTitle(page.title, this.pageStack.length > 1);

		this.sidePanel.clearContent();
		this.sidePanel.appendChild(page.render());
		page.open();
	}
}

export function enableDebugInspectors(coppola: Director) {
	new DebugManager(coppola);
}

export function enableDebug(state: boolean) {
	const btn = document.getElementById(GAMER2D_DEBUG);
	if (btn) btn.style.visibility = state ? "" : "hidden";
}

// :hover -> rgb(85 171 247 / 58%)
