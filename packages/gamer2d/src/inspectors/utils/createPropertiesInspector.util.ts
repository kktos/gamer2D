export function createPropertiesInspector(root: HTMLElement) {
	const inspector = document.createElement("properties-inspector");
	inspector.id = "inspector";
	root.append(inspector);
	return inspector;
}
