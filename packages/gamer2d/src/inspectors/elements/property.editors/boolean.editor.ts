import type { PropertiesInspector } from "../properties.inspector";
import type { PropertyConfig, PropertyEditor } from "./editors.intf";

export const BooleanEditor: PropertyEditor = {
	supports: (config: PropertyConfig, value: unknown): boolean => config.editor === "boolean" && (typeof value === "boolean" || typeof value === "number"),
	render: (cell: HTMLTableCellElement, key: string, value: boolean | number, config: PropertyConfig, inspector: PropertiesInspector): void => {
		let input = cell.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
		if (!input) {
			cell.innerHTML = "";
			input = document.createElement("input");
			input.type = "checkbox";
			input.style.margin = "auto";
			input.style.display = "block";
			input.addEventListener("change", () => {
				inspector.dispatchEvent(
					new CustomEvent("property-changed", {
						detail: { key, value: input?.checked },
						bubbles: true,
						composed: true,
					}),
				);
			});
			cell.appendChild(input);
		}
		const checked = !!value;
		if (inspector.shadowRoot?.activeElement !== input && input.checked !== checked) {
			input.checked = checked;
		}
	},
};
