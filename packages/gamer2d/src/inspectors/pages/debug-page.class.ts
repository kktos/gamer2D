import type { Director } from "../../scenes/Director";

export class DebugPage {
	constructor(
		public coppola: Director,
		public title: string,
	) {}

	render(): HTMLElement {
		return document.createElement("div");
	}
	open() {}
	close() {}
}
