import type { ArgColor } from "../../../../types/value.types";
import { tokens } from "../../lexer";

export type TSceneBackgroundSheet = {
	type: "background";
	color: ArgColor; // | number;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class BackgroundLayerRules {
	static backgroundLayerSheet($) {
		return $.RULE("backgroundLayerSheet", () => {
			$.CONSUME(tokens.Background);

			const sheet = { type: "background" };

			$.CONSUME(tokens.OpenCurly);

			const { name, value } = $.SUBRULE($.backgroundColor);
			sheet[name] = value;

			$.CONSUME(tokens.CloseCurly);

			return sheet;
		});
	}

	static backgroundColor($) {
		return $.RULE("backgroundColor", () => {
			$.CONSUME(tokens.Color);
			const value = $.OR([{ ALT: () => $.SUBRULE($.number) }, { ALT: () => $.SUBRULE($.htmlColor) }]);
			return { name: "color", value };
		});
	}
}
