import type { PropertiesInspector } from "../properties.inspector";

export interface PropertyEditor {
	/**
	 * Return true if this editor can handle the given config and value.
	 */
	supports(config: PropertyConfig, value: unknown): boolean;

	/**
	 * Render the editor into the given cell.
	 */
	render(cell: HTMLTableCellElement, key: string, value: unknown, config: PropertyConfig, inspector: PropertiesInspector): void;
}

// Define these interfaces within the file or import from a shared types file
export interface PropertyEditorOption {
	label: string;
	value: unknown;
}

export interface PropertyConfig {
	editable?: boolean;
	editor?: "text" | "number" | "boolean" | "select" | "rgba" | "point" | "array";
	options?: string[] | PropertyEditorOption[];
	min?: number;
	max?: number;
	step?: number;
	renderer?: (value: unknown, key: string, config: PropertyConfig) => HTMLElement | string;
}

export interface PropertyConfigMap {
	[key: string]: PropertyConfig;
}
