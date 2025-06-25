import type { PropertiesInspector } from "../properties.inspector";
import type { PropertyConfig, PropertyEditor } from "./editors.intf";

export const TextEditor: PropertyEditor = {
	supports: (config: PropertyConfig, value: unknown): boolean => config.editor === "text" && typeof value === "string",
	render: (cell: HTMLTableCellElement, key: string, value: string, _config: PropertyConfig, inspector: PropertiesInspector): void => {
		let input = cell.querySelector('input[type="text"]') as HTMLInputElement | null;
		if (!input) {
			cell.innerHTML = "";
			input = document.createElement("input");
			input.type = "text";
			input.style.width = "100%";
			input.addEventListener("change", () => {
				inspector.dispatchEvent(
					new CustomEvent("property-changed", {
						detail: { key, value: input?.value },
						bubbles: true,
						composed: true,
					}),
				);
			});
			cell.appendChild(input);
		}
		if (inspector.shadowRoot?.activeElement !== input && value !== input.value) {
			input.value = value;
		}
	},
};
