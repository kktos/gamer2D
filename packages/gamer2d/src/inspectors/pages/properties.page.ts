import type { Director } from "../../scenes/Director";
import type { PropertiesInspector } from "../elements/properties.inspector";
import { DebugPage } from "./debug-page.class";

export class PropertiesPage extends DebugPage {
	private element!: PropertiesInspector;

	constructor(
		public coppola: Director,
		public title: string,
		private params: { data },
	) {
		super(coppola, title);
		const objectName = this.params?.data?.name;
		if (objectName) this.title = `${this.title} ${objectName}`;
	}

	render(): HTMLElement {
		this.element = document.createElement("properties-inspector") as PropertiesInspector;
		return this.element;
	}

	open() {
		this.element.update(this.params.data);
	}

	close() {}
}
