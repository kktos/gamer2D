import type { PropertiesInspector } from "../properties.inspector";
import type { PropertyConfig, PropertyEditor, PropertyEditorOption } from "./editors.intf";

export const SelectEditor: PropertyEditor = {
	supports: (config: PropertyConfig, _value: unknown): boolean => config.editor === "select" && Array.isArray(config.options),
	render: (cell: HTMLTableCellElement, key: string, value: unknown, config: PropertyConfig, inspector: PropertiesInspector): void => {
		let select = cell.querySelector("select") as HTMLSelectElement | null;
		const options = config.options as (string | PropertyEditorOption[]) | undefined;
		if (!select && Array.isArray(options)) {
			cell.innerHTML = "";
			select = document.createElement("select");
			select.style.width = "100%";
			for (const opt of options) {
				const optionElement = document.createElement("option");
				if (typeof opt === "string") {
					optionElement.value = opt;
					optionElement.textContent = opt;
				} else {
					optionElement.value = String(opt.value);
					optionElement.textContent = opt.label;
				}
				select.appendChild(optionElement);
			}
			select.addEventListener("change", () => {
				let selectedValue = select?.value;
				const originalOption = Array.isArray(options) ? options.find((o) => typeof o !== "string" && String(o.value) === select?.value) : undefined;
				if (originalOption && typeof originalOption !== "string") {
					selectedValue = String(originalOption.value);
				} else {
					const numVal = Number(select?.value);
					if (typeof value === "number" && !Number.isNaN(numVal) && String(numVal) === select?.value) {
						selectedValue = String(numVal);
					}
				}
				inspector.dispatchEvent(
					new CustomEvent("property-changed", {
						detail: { key, value: selectedValue },
						bubbles: true,
						composed: true,
					}),
				);
			});
			cell.appendChild(select);
		}
		if (select && inspector.shadowRoot?.activeElement !== select) {
			const stringValueToMatch = String(value);
			if (select.value !== stringValueToMatch) {
				select.value = stringValueToMatch;
			}
		}
	},
};
