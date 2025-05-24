export function createItemsInspector(root: HTMLElement) {
	const inspector = document.createElement("items-inspector");
	inspector.id = "items-inspector";

	inspector.style.setProperty("--color", "white");

	root.append(inspector);
	return inspector;
}
