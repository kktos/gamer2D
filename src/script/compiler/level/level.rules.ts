import type { DIRECTIONS } from "../../../types/direction.type";
import type { TupleToUnion } from "../../../types/typescript.types";
import type { ArgColor, ArgExpression, ArgVariable } from "../../../types/value.types";
import { tokens } from "../lexer";

const CONCAT = Symbol.for("concat");

export type TSceneLevelSheet = {
	type: "level";
	name: string;
	showCursor?: boolean;
	background?: ArgColor;
	font?: string;
	settings?: Record<string, unknown>;
	sprites?: {
		name: string;
		pos: [number | ArgVariable | ArgExpression, number | ArgVariable | ArgExpression];
		dir: TupleToUnion<[typeof DIRECTIONS.LEFT, typeof DIRECTIONS.RIGHT]>;
	}[];
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class LevelRules {
	static levelSheet($) {
		return $.RULE("levelSheet", () => {
			$.CONSUME(tokens.Level);

			const sheet: TSceneLevelSheet = {
				type: "level",
				name: $.CONSUME(tokens.StringLiteral).payload,
			};

			$.CONSUME(tokens.OpenCurly);

			$.MANY(() => {
				const { name, value, [CONCAT]: wannaConcat } = $.SUBRULE($.levelProps);
				if (wannaConcat) {
					if (!sheet[name]) sheet[name] = [];
					sheet[name].push(value);
				} else sheet[name] = value;
			});

			$.CONSUME(tokens.CloseCurly);

			return sheet;
		});
	}

	static levelProps($) {
		return $.RULE("levelProps", () => {
			return $.OR([
				{ ALT: () => $.SUBRULE($.background) },
				{ ALT: () => $.SUBRULE($.showCursor) },
				{ ALT: () => $.SUBRULE($.font) },
				{ ALT: () => $.SUBRULE($.levelSettings) },
				{ ALT: () => $.SUBRULE($.levelSprite) },
			]);
		});
	}

	static levelSettings($) {
		return $.RULE("levelSettings", () => {
			$.CONSUME(tokens.Settings);

			$.CONSUME(tokens.OpenCurly);
			const settings = {};
			$.MANY(() => {
				const name = $.CONSUME(tokens.Identifier).image;

				$.CONSUME(tokens.Equal);

				const value = $.SUBRULE($.layoutSetValue);

				settings[name] = value;
			});
			$.CONSUME(tokens.CloseCurly);

			return { name: "settings", value: settings };
		});
	}

	static levelSprite($) {
		return $.RULE("levelSprite", () => {
			$.CONSUME(tokens.Sprite);
			return {
				name: "sprites",
				value: {
					name: $.CONSUME(tokens.StringLiteral).payload,
					pos: $.SUBRULE($.parm_at),
					dir: $.SUBRULE($.parm_dir),
				},
				[CONCAT]: true,
			};
		});
	}
}
