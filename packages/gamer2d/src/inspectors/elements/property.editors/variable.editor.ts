import { ArgVariable } from "../../../types/value.types";
import type { PropertiesInspector } from "../properties.inspector";
import type { PropertyConfig, PropertyEditor } from "./editors.intf";

export const VariableEditor: PropertyEditor = {
	supports: (_config: PropertyConfig, value: unknown): boolean => value instanceof ArgVariable,
	render: (cell: HTMLTableCellElement, key: string, value: ArgVariable, _config: PropertyConfig, inspector: PropertiesInspector): void => {
		let variableDiv = cell.querySelector("div") as HTMLDivElement | null;
		if (!variableDiv) {
			variableDiv = document.createElement("div");
			variableDiv.className = "variable";
			cell.appendChild(variableDiv);

			const varName = value?.value;
			let div = document.createElement("div");
			div.innerText = `$${varName} :`;
			variableDiv.appendChild(div);

			const varValue = inspector.evalValue?.(varName) ?? "!?! error !?!";
			div = document.createElement("div");
			div.style.flex = "1";
			div.innerText = String(varValue);
			variableDiv.appendChild(div);

			const btn = document.createElement("button");
			btn.textContent = "Set";
			variableDiv.appendChild(btn);

			btn.addEventListener("click", () => {
				inspector.dispatchEvent(
					new CustomEvent("property-changed", {
						detail: { key, value: varValue },
						bubbles: true,
						composed: true,
					}),
				);
			});
		}
	},
};
