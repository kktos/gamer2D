import { tokens } from "../../lexer";
import type { TSprite } from "../display/layout/sprite.rules";

export type TEntitiesLayerSprite = Pick<TSprite, "id" | "pos" | "range" | "dir" | "traits"> & {
	name: string;
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
		return $.RULE("entitiesLayerSprite", (options) => {
			$.CONSUME(tokens.Sprite);

			const result: Partial<TEntitiesLayerSprite> = {
				name: $.CONSUME(tokens.StringLiteral).payload,
			};

			$.MANY(() => {
				$.OR([
					{
						ALT: () => {
							$.CONSUME(tokens.ID);
							$.CONSUME2(tokens.Colon);
							result.id = $.CONSUME3(tokens.StringLiteral).payload;
						},
					},
					{
						ALT: () => {
							result.pos = $.SUBRULE($.parm_at);
						},
					},
					{
						ALT: () => {
							result.range = $.SUBRULE($.parm_range);
						},
					},
					{
						ALT: () => {
							result.dir = $.SUBRULE($.parm_dir);
						},
					},
					{
						ALT: () => {
							result.traits = $.SUBRULE($.parm_traits);
						},
					},
				]);
			});

			if (!result.pos) throw new TypeError("Missing required prop 'at:'");

			return result;
		});
	}
}
