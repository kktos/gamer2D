import { DebugPage } from "./debug-page.class";

export class MenuPage extends DebugPage {
	render(): HTMLElement {
		const menu = document.createElement("div");
		menu.appendChild(createTemplate());
		return menu;
	}
}

function createTemplate() {
	const template = document.createElement("template");
	template.innerHTML = `
		<debug-menu>
			<debug-menu-item key="game">Game</debug-menu-item>
			<debug-menu-item key="scene">Current Scene</debug-menu-item>
			<debug-menu-item key="variables">Variables</debug-menu-item>
		</debug-menu>
	`;
	return template.content.cloneNode(true) as HTMLElement;
}
