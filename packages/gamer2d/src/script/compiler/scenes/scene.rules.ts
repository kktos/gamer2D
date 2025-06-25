import type { TLayerSheet } from "../layers/layer.rules";
import { tokens } from "../lexer";

// export type TLayerDef = {
// 	type: string;
// 	name?: string;
// };

export type TSceneSheet = {
	type: "display" | "game" | "level";
	name: string;
	layers: TLayerSheet[];
	showCursor?: boolean;
	debug?: boolean;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class SceneSheetRules {
	static sceneSheet($) {
		return $.RULE("sceneSheet", () => {
			const { type, name } = $.SUBRULE($.sceneSheetTypeAndName);
			const sheet: TSceneSheet = { type, name, layers: [] };

			$.CONSUME(tokens.OpenCurly);

			$.MANY(() => {
				$.OR([
					{
						ALT: () => {
							sheet.debug = $.SUBRULE($.sceneDebug);
						},
					},
					{
						ALT: () => {
							sheet.showCursor = $.SUBRULE($.sceneShowCursor);
						},
					},
				]);
			});

			$.AT_LEAST_ONE(() => {
				const layer = $.OR2([
					{ ALT: () => $.SUBRULE($.displayLayerSheet) },
					{ ALT: () => $.SUBRULE($.gameLayerSheet) },
					{ ALT: () => $.SUBRULE($.levelLayerSheet) },
					{ ALT: () => $.SUBRULE($.backgroundLayerSheet) },
					{ ALT: () => $.SUBRULE($.entitiesLayerSheet) },
					{ ALT: () => $.SUBRULE($.userDefinedLayerSheet) },
					{ ALT: () => $.SUBRULE($.globalsLayerSheet) },
					{
						ALT: () => {
							$.CONSUME(tokens.Layer);
							return { type: "*", name: $.CONSUME(tokens.StringLiteral).payload };
						},
					},
				]);
				sheet.layers.push(layer);
			});

			$.CONSUME(tokens.CloseCurly);

			return sheet;
		});
	}

	static sceneSheetTypeAndName($) {
		return $.RULE("sceneSheetTypeAndName", () => {
			const type = $.OR([{ ALT: () => $.CONSUME(tokens.Display) }, { ALT: () => $.CONSUME(tokens.Game) }, { ALT: () => $.CONSUME(tokens.Level) }]).image;
			const name = $.CONSUME(tokens.StringLiteral).payload;
			return { type, name };
		});
	}

	static sceneProps($) {
		return $.RULE("sceneProps", () => {
			return $.OR([{ ALT: () => $.SUBRULE($.font) }, { ALT: () => $.SUBRULE($.settingsBlock) }]);
		});
	}

	static sceneDebug($) {
		return $.RULE("sceneDebug", (_sheet) => {
			$.CONSUME(tokens.Debug);
			return $.OR([
				{
					ALT: () => {
						$.CONSUME(tokens.True);
						return true;
					},
				},
				{
					ALT: () => {
						$.CONSUME(tokens.False);
						return false;
					},
				},
			]);
		});
	}

	static sceneShowCursor($) {
		return $.RULE("sceneShowCursor", () => {
			$.CONSUME(tokens.ShowCursor);
			return true;
		});
	}
}
