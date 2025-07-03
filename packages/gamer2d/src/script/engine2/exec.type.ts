import type { Font } from "../../game";
import type { Scene } from "../../scenes";
import type { NeatVariableStore } from "../../utils/vars.store";
import type { TAlignType } from "../compiler2/types/align.type";
import type { NeatFunctions } from "./functions/functionDict.utils";

// Command execution context - holds rendering state, variables, etc.
export interface ExecutionContext {
	variables: NeatVariableStore;
	functions: NeatFunctions;

	// Current rendering state
	currentFont?: Font;
	currentFontSize?: number;
	currentColor?: string;
	currentBgColor?: string;
	currentAlign?: TAlignType;
	currentVAlign?: TAlignType;
	currentZoom?: number;

	currentScene?: Scene;

	[key: string]: unknown;
}
