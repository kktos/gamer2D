import type { PropertiesInspector } from "../properties.inspector";
import type { PropertyConfig, PropertyEditor } from "./editors.intf";

export const NumberEditor: PropertyEditor = {
	supports: (config: PropertyConfig, value: unknown) => config.editor === "number" && typeof value === "number",
	render: (cell: HTMLTableCellElement, key: string, value: number, config: PropertyConfig, inspector: PropertiesInspector) => {
		let input = cell.querySelector('input[type="number"]') as HTMLInputElement | null;
		if (!input) {
			cell.innerHTML = "";
			input = document.createElement("input");
			input.type = "number";
			input.style.width = "100%";
			if (config.min !== undefined) input.min = String(config.min);
			if (config.max !== undefined) input.max = String(config.max);
			if (config.step !== undefined) input.step = String(config.step);
			input.addEventListener("change", () => {
				inspector.dispatchEvent(
					new CustomEvent("property-changed", {
						detail: { key, value: input?.valueAsNumber },
						bubbles: true,
						composed: true,
					}),
				);
			});
			cell.appendChild(input);
		}
		if (inspector.shadowRoot?.activeElement !== input && value !== input.valueAsNumber) input.valueAsNumber = value;
	},
};
