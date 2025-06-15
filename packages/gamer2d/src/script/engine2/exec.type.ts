import type { Font } from "../../game";
import type { TNeatFunctions } from "../../utils/functionDict.utils";
import type { TVars } from "../../utils/vars.utils";
import type { TAlignType } from "../compiler2/types/align.type";

// Command execution context - holds rendering state, variables, etc.
export interface ExecutionContext {
	renderer?: TNeatRenderer;
	variables: TVars;
	functions: TNeatFunctions;

	// Current rendering state
	currentFont?: Font;
	currentFontSize?: number;
	currentColor?: string;
	currentAlign?: TAlignType;
	currentVAlign?: TAlignType;

	[key: string]: unknown;
}

interface TNeatRenderer {
	drawRect(x: number, y: number, width: number, height: number, color: string, fill?: string): void;
}
