import { OP_TYPES } from "../../../../types/operation.types";
import type { ArgColor } from "../../../../types/value.types";
import { tokens } from "../../lexer";
import type { TSet } from "./layout/set.rules";
import type { TEventHandlerDict } from "./on.rules";
import type { TSoundDefs } from "./sound.rules";

export type SceneSheetUI = {
	pos: "top" | "bottom";
	background?: ArgColor;
};

export type TLayerDisplaySheet = {
	type: "display";
	ui?: SceneSheetUI;
	font?: string;
	layout?: unknown[];
	sounds?: TSoundDefs;
	on?: TEventHandlerDict;
	settings?: Record<string, unknown>;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class DisplayRules {
	static displayLayerSheet($) {
		return $.RULE("displayLayerSheet", () => {
			$.CONSUME(tokens.Display);
			const sheet = { type: "display" };

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
				{ ALT: () => $.SUBRULE($.font) },
				{ ALT: () => $.SUBRULE($.layout) },
				{ ALT: () => $.SUBRULE($.sound, { ARGS: [sheet] }) },
				{ ALT: () => $.SUBRULE($.displayTimer, { ARGS: [sheet] }) },
				{ ALT: () => $.SUBRULE($.displayOnEvent, { ARGS: [sheet] }) },
				{ ALT: () => $.SUBRULE($.displayUI) },
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
}
