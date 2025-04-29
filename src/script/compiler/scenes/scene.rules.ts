import { tokens } from "../lexer";

export type TLayerDef = {
	type: string;
	name?: string;
};

export type TSceneSheet = {
	type: "display" | "game" | "level";
	name: string;
	layers: TLayerDef[];
	showCursor?: boolean;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class SceneSheetRules {
	static sceneSheet($) {
		return $.RULE("sceneSheet", () => {
			const { type, name } = $.SUBRULE($.sceneSheetTypeAndName);
			const sheet: TSceneSheet = { type, name, layers: [] };

			$.CONSUME(tokens.OpenCurly);

			$.OPTION(() => {
				sheet.showCursor = $.SUBRULE($.sceneShowCursor);
			});

			$.AT_LEAST_ONE(() => {
				const layer = $.OR([
					{ ALT: () => $.SUBRULE($.displayLayerSheet) },
					{ ALT: () => $.SUBRULE($.gameLayerSheet) },
					{ ALT: () => $.SUBRULE($.levelLayerSheet) },
					{ ALT: () => $.SUBRULE($.backgroundLayerSheet) },
					{ ALT: () => $.SUBRULE($.entitiesLayerSheet) },
					{ ALT: () => $.SUBRULE($.userDefinedLayerSheet) },
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
			return $.OR([{ ALT: () => $.SUBRULE($.font) }, { ALT: () => $.SUBRULE($.settingsBlock) }, { ALT: () => $.SUBRULE($.levelSprite) }]);
		});
	}

	static sceneShowCursor($) {
		return $.RULE("sceneShowCursor", () => {
			$.CONSUME(tokens.ShowCursor);
			return true;
		});
	}
}
