import { ArgColor } from "../../../types/value.types";
import type { PropertiesInspector } from "../properties.inspector";
import type { PropertyConfig, PropertyEditor } from "./editors.intf";

function rgbaToHex(color: string): string {
	const ctx = document.createElement("canvas").getContext("2d");
	if (!ctx) return "#000000";
	ctx.fillStyle = color;
	const computed = ctx.fillStyle;
	const m = computed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
	if (m) {
		const r = Number.parseInt(m[1]).toString(16).padStart(2, "0");
		const g = Number.parseInt(m[2]).toString(16).padStart(2, "0");
		const b = Number.parseInt(m[3]).toString(16).padStart(2, "0");
		return `#${r}${g}${b}`;
	}
	if (/^#[0-9a-f]{6}$/i.test(color)) return color;
	return "#000000";
}

export const RgbaEditor: PropertyEditor = {
	supports: (config: PropertyConfig, value: unknown): boolean => config.editor === "rgba" && (typeof value === "string" || value instanceof ArgColor),
	render: (cell: HTMLTableCellElement, key: string, value: string | ArgColor, _config: PropertyConfig, inspector: PropertiesInspector): void => {
		let wrapper = cell.querySelector(".rgba-editor") as HTMLDivElement | null;
		const colorValue = typeof value === "string" ? value : value?.value;
		if (!wrapper) {
			cell.innerHTML = "";
			wrapper = document.createElement("div");
			wrapper.className = "rgba-editor";
			wrapper.style.display = "flex";
			wrapper.style.alignItems = "center";
			wrapper.style.gap = "8px";

			const colorInput = document.createElement("input");
			colorInput.type = "color";
			colorInput.style.width = "32px";
			colorInput.style.height = "32px";
			colorInput.style.border = "none";
			colorInput.style.borderRadius = "4px";
			colorInput.style.background = "none";
			colorInput.style.padding = "0";
			colorInput.style.margin = "0";
			colorInput.value = rgbaToHex(colorValue ?? "");
			wrapper.appendChild(colorInput);

			const textInput = document.createElement("input");
			textInput.type = "text";
			textInput.value = colorValue ?? "";
			textInput.style.width = "90px";
			wrapper.appendChild(textInput);

			textInput.addEventListener("input", () => {
				const val = textInput.value;
				try {
					colorInput.value = rgbaToHex(val);
				} catch {}
				if (value instanceof ArgColor) value.value = colorInput.value;
				else
					inspector.dispatchEvent(
						new CustomEvent("property-changed", {
							detail: { key, value: val },
							bubbles: true,
							composed: true,
						}),
					);
			});

			colorInput.addEventListener("input", () => {
				const hex = colorInput.value;
				textInput.value = hex;
				if (value instanceof ArgColor) value.value = hex;
				else
					inspector.dispatchEvent(
						new CustomEvent("property-changed", {
							detail: { key, value: hex },
							bubbles: true,
							composed: true,
						}),
					);
			});

			cell.appendChild(wrapper);
		} else {
			const colorInput = wrapper.querySelector('input[type="color"]') as HTMLInputElement | null;
			const textInput = wrapper.querySelector('input[type="text"]') as HTMLInputElement | null;
			if (textInput) textInput.value = colorValue ?? "";
			if (colorInput) {
				try {
					colorInput.value = rgbaToHex(colorValue ?? "");
				} catch {}
			}
		}
	},
};
