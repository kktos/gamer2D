import type { DIRECTIONS } from "../../../../types/direction.type";
import type { TupleToUnion } from "../../../../types/typescript.types";
import type { ArgExpression, ArgVariable } from "../../../../types/value.types";
import { tokens } from "../../lexer";

export type TEntitiesLayerSprite = {
	name: string;
	pos: [number | ArgVariable | ArgExpression, number | ArgVariable | ArgExpression];
	dir: TupleToUnion<[typeof DIRECTIONS.LEFT, typeof DIRECTIONS.RIGHT]>;
};
export type TEntitiesLayerSheet = {
	type: "entities";
	settings?: Record<string, unknown>;
	sprites?: TEntitiesLayerSprite[];
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class EntitiesLayerRules {
	static entitiesLayerSheet($) {
		return $.RULE("entitiesLayerSheet", () => {
			$.CONSUME(tokens.Entities);

			const sheet: TEntitiesLayerSheet = { type: "entities" };

			$.CONSUME(tokens.OpenCurly);

			$.OPTION(() => {
				const settings = $.SUBRULE($.settingsBlock, { ARGS: [{ onlyValue: true }] });
				if (Object.keys(settings).length) sheet.settings = settings;
			});

			$.OPTION2(() => {
				const sprites: TEntitiesLayerSprite[] = [];
				$.MANY(() => {
					const sprite = $.SUBRULE($.entitiesLayerSprite);
					sprites.push(sprite);
				});
				if (sprites.length) sheet.sprites = sprites;
			});

			$.CONSUME(tokens.CloseCurly);

			return sheet;
		});
	}

	static entitiesLayerSprite($) {
		return $.RULE("entitiesLayerSprite", () => {
			$.CONSUME(tokens.Sprite);
			return {
				name: $.CONSUME(tokens.StringLiteral).payload,
				pos: $.SUBRULE($.parm_at),
				dir: $.SUBRULE($.parm_dir),
			};
		});
	}
}
