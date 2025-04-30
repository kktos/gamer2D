import { tokens } from "../lexer";

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
			]);

			return layer;
		});
	}
}
