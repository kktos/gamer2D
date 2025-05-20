import type { DIRECTIONS } from "../../../../types/direction.type";
import type { TupleToUnion } from "../../../../types/typescript.types";
import type { ArgExpression, ArgVariable } from "../../../../types/value.types";
import { tokens } from "../../lexer";

const CONCAT = Symbol.for("concat");

export type TLayerLevelSheet = {
	type: "level";
	font?: string;
	settings: Record<string, unknown>;
	sprites?: {
		name: string;
		pos: [number | ArgVariable | ArgExpression, number | ArgVariable | ArgExpression];
		dir: TupleToUnion<[typeof DIRECTIONS.LEFT, typeof DIRECTIONS.RIGHT]>;
	}[];
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class LevelRules {
	static levelLayerSheet($) {
		return $.RULE("levelLayerSheet", () => {
			$.CONSUME(tokens.Level);

			const sheet: TLayerLevelSheet = {
				type: "level",
				settings: {},
			};

			$.CONSUME(tokens.OpenCurly);

			$.MANY(() => {
				const { name, value, [CONCAT]: wannaConcat } = $.SUBRULE($.levelProps);
				if (wannaConcat) {
					if (!sheet[name]) sheet[name] = [];
					sheet[name].push(value);
				} else sheet[name] = value;
			});

			$.ACTION(() => {
				if (Object.keys(sheet.settings).length === 0) throw new TypeError("No Settings !?!");
			});

			$.CONSUME(tokens.CloseCurly);

			return sheet;
		});
	}

	static levelProps($) {
		return $.RULE("levelProps", () => {
			return $.OR([{ ALT: () => $.SUBRULE($.font) }, { ALT: () => $.SUBRULE($.settingsBlock) }]);
		});
	}
}
