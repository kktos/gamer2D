import { DebugPage } from "./debug-page.class";
import { EntitiesPage } from "./entities.page";
import { EntityPropsPage } from "./entity-props.page";

export const PAGES = {
	entities: { title: "Entities", class: EntitiesPage },
	"entity-props": { title: "Properties", class: EntityPropsPage },
};

export class MenuPage extends DebugPage {
	render(): HTMLElement {
		const menu = createTemplate();
		const container = menu.querySelector(".menu-container");

		// biome-ignore lint/complexity/noForEach: <explanation>
		container?.querySelectorAll<HTMLButtonElement>(".menu-btn").forEach((btn) => {
			btn.addEventListener("click", () => {
				if (btn.dataset.id)
					container.dispatchEvent(
						new CustomEvent("goto-page", {
							detail: { pageDef: PAGES[btn.dataset.id] },
							bubbles: true,
							composed: true,
						}),
					);
			});
		});

		// Return a real element for slotting
		const wrapper = document.createElement("div");
		wrapper.appendChild(menu);
		return wrapper;
	}
}

function createTemplate() {
	const template = document.createElement("template");
	template.innerHTML = `
		<style>
			.menu-container {
				display: grid;
				grid-template-columns: repeat(2, 1fr);
				gap: 12px;
				padding: 16px;
			}
			.menu-btn {
				padding: 10px 20px;
				font-size: 16px;
				cursor: pointer;
				border-radius: 6px;
				border: 1px solid #1976d2;
				// background: #e3f2fd;
				// color: #1976d2;
				background: transparent;
				color: white;
				transition: background 0.2s, color 0.2s;
				aspect-ratio: 1;
			}
			.menu-btn:hover {
				background: #1976d2;
				color: #fff;
			}
		</style>
		<div class="menu-container">
			<button class="menu-btn" data-id="entities">Entities</button>
			<button class="menu-btn" data-id="variables">Variables</button>
			<button class="menu-btn" data-id="scene">Scene</button>
			<button class="menu-btn" data-id="game">Game</button>
		</div>
	`;
	return template.content.cloneNode(true) as HTMLElement;
}
