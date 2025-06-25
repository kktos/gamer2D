import type { PropertiesInspector } from "../properties.inspector";
import type { PropertyConfig, PropertyEditor } from "./editors.intf";

export const ArrayEditor: PropertyEditor = {
	supports: (config: PropertyConfig, value: unknown): boolean =>
		config.editor === "array" && Array.isArray(value) && (value.every((v) => typeof v === "string") || value.every((v) => typeof v === "number")),

	render: (cell: HTMLTableCellElement, key: string, value: string[] | number[], _config: PropertyConfig, inspector: PropertiesInspector): void => {
		cell.innerHTML = "";
		const isNumberArray = value.every((v) => typeof v === "number");

		const list = document.createElement("ul");
		list.style.listStyle = "none";
		list.style.margin = "0";
		list.style.padding = "0";

		value.forEach((item, idx) => {
			const li = document.createElement("li");
			li.style.display = "flex";
			li.style.alignItems = "center";
			li.style.gap = "6px";

			const input = document.createElement("input");
			input.type = isNumberArray ? "number" : "text";
			input.value = String(item);
			input.style.width = "80px";
			input.addEventListener("change", () => {
				const newValue = isNumberArray ? Number(input.value) : input.value;
				const newArr = [...value];
				newArr[idx] = newValue;
				inspector.dispatchEvent(
					new CustomEvent("property-changed", {
						detail: { key, value: newArr },
						bubbles: true,
						composed: true,
					}),
				);
			});
			li.appendChild(input);

			// Remove button
			const removeBtn = document.createElement("button");
			removeBtn.textContent = "✕";
			removeBtn.title = "Remove item";
			removeBtn.style.marginLeft = "4px";
			removeBtn.addEventListener("click", () => {
				const newArr = value.slice(0, idx).concat(value.slice(idx + 1));
				inspector.dispatchEvent(
					new CustomEvent("property-changed", {
						detail: { key, value: newArr },
						bubbles: true,
						composed: true,
					}),
				);
			});
			li.appendChild(removeBtn);

			list.appendChild(li);
		});

		// Add button
		const addBtn = document.createElement("button");
		addBtn.textContent = "+";
		addBtn.title = "Add item";
		addBtn.style.marginTop = "4px";
		addBtn.addEventListener("click", () => {
			const newArr = [...value, isNumberArray ? 0 : ""];
			inspector.dispatchEvent(
				new CustomEvent("property-changed", {
					detail: { key, value: newArr },
					bubbles: true,
					composed: true,
				}),
			);
		});

		cell.appendChild(list);
		cell.appendChild(addBtn);
	},
};
