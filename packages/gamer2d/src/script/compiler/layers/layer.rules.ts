import { tokens } from "../lexer";
import type { TLayerBackgroundSheet } from "./background/background.rules";
import type { TLayerDisplaySheet } from "./display/display.rules";
import type { TLayerEntitiesSheet } from "./entities/entities.rules";
import type { TLayerGameSheet } from "./game/game.rules";
import type { TLayerGlobalsSheet } from "./globals/globals.rules";
import type { TLayerLevelSheet } from "./level/level.rules";
import type { TLayerUserDefinedSheet } from "./user_defined/user_defined.rules";

export type TLayerSheet =
	| TLayerDisplaySheet
	| TLayerGameSheet
	| TLayerLevelSheet
	| TLayerBackgroundSheet
	| TLayerEntitiesSheet
	| TLayerUserDefinedSheet
	| TLayerGlobalsSheet;
// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class LayerSheetRules {
	static layerSheet($) {
		return $.RULE("layerSheet", () => {
			$.CONSUME(tokens.Layer);

			const layer = $.OR([
				{ ALT: () => $.SUBRULE($.displayLayerSheet) },
				{ ALT: () => $.SUBRULE($.gameLayerSheet) },
				{ ALT: () => $.SUBRULE($.levelLayerSheet) },
				{ ALT: () => $.SUBRULE($.backgroundLayerSheet) },
				{ ALT: () => $.SUBRULE($.entitiesLayerSheet) },
				{ ALT: () => $.SUBRULE($.userDefinedLayerSheet) },
				{ ALT: () => $.SUBRULE($.globalsLayerSheet) },
			]);

			return layer;
		});
	}
}
