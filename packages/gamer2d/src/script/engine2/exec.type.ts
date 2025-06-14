import type { TNeatFunctions } from "../../utils/functionDict.utils";
import type { TVars } from "../../utils/vars.utils";

// Command execution context - holds rendering state, variables, etc.
export interface ExecutionContext {
	// Rendering context (canvas, webgl, etc.)
	renderer: unknown;

	variables: TVars;
	functions: TNeatFunctions;

	// Current rendering state
	currentFont?: string;
	currentFontSize?: number;
	currentColor?: string;
	currentAlign?: string;

	// Any other state you need during execution
	[key: string]: unknown;
}
