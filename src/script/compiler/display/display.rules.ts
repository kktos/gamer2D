import { OP_TYPES } from "../../../types/operation.types";
import type { ArgColor } from "../../../types/value.types";
import { tokens } from "../lexer";
import type { TSet } from "./layout/set.rules";
import type { TEventHandlers } from "./on.rules";
import type { TSoundDefs } from "./sound.rules";

export type SceneSheetUI = {
	pos: "top" | "bottom";
	background?: ArgColor;
};

export type SceneDisplaySheet = {
	type: "display";
	name: string;
	showCursor?: boolean;
	background?: ArgColor;
	layers?: string[];
	ui?: SceneSheetUI;
	font?: string;
	layout?: unknown[];
	sounds?: TSoundDefs;
	on?: TEventHandlers;
	settings?: Record<string, unknown>;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class DisplayRules {
	static displaySheet($) {
		return $.RULE("displaySheet", () => {
			$.CONSUME(tokens.Display);

			const sheet = { type: "display", name: $.CONSUME(tokens.StringLiteral).payload };

			$.CONSUME(tokens.OpenCurly);

			$.MANY(() => {
				const { name, value } = $.SUBRULE($.displayProps, { ARGS: [sheet] });
				sheet[name] = value;
			});

			$.CONSUME(tokens.CloseCurly);

			return sheet;
		});
	}

	static displayProps($) {
		return $.RULE("displayProps", (sheet) => {
			return $.OR([
				{ ALT: () => $.SUBRULE($.background) },
				{ ALT: () => $.SUBRULE($.showCursor) },
				{ ALT: () => $.SUBRULE($.font) },
				{ ALT: () => $.SUBRULE($.layout) },
				{ ALT: () => $.SUBRULE($.sound, { ARGS: [sheet] }) },
				{ ALT: () => $.SUBRULE($.displayTimer, { ARGS: [sheet] }) },
				{ ALT: () => $.SUBRULE($.displayOnEvent, { ARGS: [sheet] }) },
				{ ALT: () => $.SUBRULE($.displayUI) },
				{ ALT: () => $.SUBRULE($.displayLayers) },
				{ ALT: () => $.SUBRULE($.displaySettings) },
			]);
		});
	}

	static displaySettings($) {
		return $.RULE("displaySettings", () => {
			$.CONSUME(tokens.Settings);
			$.CONSUME(tokens.OpenCurly);

			const settings = {};
			$.MANY(() => {
				const { name, value } = $.SUBRULE($.displaySet);
				settings[name] = value;
			});

			$.CONSUME(tokens.CloseCurly);

			return { name: "settings", value: settings };
		});
	}

	static displaySet($) {
		return $.RULE("displaySet", () => {
			const result: TSet = {
				type: OP_TYPES.SET,
				name: $.CONSUME(tokens.Identifier).image,
				value: 0,
			};

			$.CONSUME(tokens.Equal);

			result.value = $.SUBRULE($.layoutSetValue);

			$.variablesDict.set(result.name, result.value);

			return result;
		});
	}

	static displayLayers($) {
		return $.RULE("displayLayers", () => {
			$.CONSUME(tokens.Layers);

			$.CONSUME(tokens.OpenCurly);

			const result: { name: string; value: string[] } = { name: "layers", value: [] };

			$.AT_LEAST_ONE(() => {
				result.value.push($.CONSUME(tokens.Identifier).image);
			});

			$.CONSUME(tokens.CloseCurly);

			return result;
		});
	}
}
