import type { PropertiesInspector } from "../properties.inspector";
import type { PropertyConfig, PropertyEditor } from "./editors.intf";

export const PointEditor: PropertyEditor = {
	supports: (config: PropertyConfig, value: unknown) => config.editor === "point" && Array.isArray(value) && value.length === 2,
	render: (cell: HTMLTableCellElement, key: string, value: [number, number], config: PropertyConfig, inspector: PropertiesInspector) => {
		let inputs: HTMLInputElement[] | NodeListOf<HTMLInputElement> = cell.querySelectorAll<HTMLInputElement>('input[type="number"]');
		if (!inputs.length) {
			cell.innerHTML = "";
			const inputX = document.createElement("input") as HTMLInputElement;
			inputX.type = "number";
			inputX.style.width = "50%";
			if (config.min !== undefined) inputX.min = String(config.min);
			if (config.max !== undefined) inputX.max = String(config.max);
			if (config.step !== undefined) inputX.step = String(config.step);
			inputX.addEventListener("change", () => {
				inspector.dispatchEvent(
					new CustomEvent("property-changed", {
						detail: { key, value: [inputX?.valueAsNumber, value[1]] },
						bubbles: true,
						composed: true,
					}),
				);
			});
			cell.appendChild(inputX);
			const inputY = document.createElement("input") as HTMLInputElement;
			inputY.type = "number";
			inputY.style.width = "50%";
			if (config.min !== undefined) inputY.min = String(config.min);
			if (config.max !== undefined) inputY.max = String(config.max);
			if (config.step !== undefined) inputY.step = String(config.step);
			inputY.addEventListener("change", () => {
				inspector.dispatchEvent(
					new CustomEvent("property-changed", {
						detail: { key, value: [value[0], inputY?.valueAsNumber] },
						bubbles: true,
						composed: true,
					}),
				);
			});
			cell.appendChild(inputY);
			inputs = [inputX, inputY];
		}

		if (
			inspector.shadowRoot?.activeElement !== inputs[0] &&
			inspector.shadowRoot?.activeElement !== inputs[1] &&
			value[0] !== inputs[0].valueAsNumber &&
			value[1] !== inputs[1].valueAsNumber
		) {
			inputs[0].valueAsNumber = value[0];
			inputs[1].valueAsNumber = value[1];
		}
	},
};
