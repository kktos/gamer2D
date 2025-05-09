import { OP_TYPES } from "../../../../types/operation.types";
import { tokens } from "../../lexer";
import type { TRepeat, TRepeatItem } from "../display/layout/repeat.rules";
import type { TSprite } from "../display/layout/sprite.rules";

export type TEntitiesLayerSprite = Pick<TSprite, "type" | "id" | "pos" | "range" | "dir" | "traits" | "width" | "height"> & {
	name: string;
};
export type TEntitiesLayerStatement = TEntitiesLayerSprite | TRepeat;

export type TEntitiesLayerSheet = {
	type: "entities";
	settings?: Record<string, unknown>;
	statements?: TEntitiesLayerStatement[];
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

			const statements: TEntitiesLayerStatement[] = [];
			$.MANY(() => {
				$.OR([
					{
						ALT: () => {
							const sprites: TRepeatItem[] = [];
							const result: TRepeat = $.SUBRULE($.layoutForClause);
							$.CONSUME2(tokens.OpenCurly);
							$.MANY2(() => sprites.push($.SUBRULE2($.entitiesLayerSprite)));
							$.CONSUME2(tokens.CloseCurly);
							$.ACTION(() => {
								result.items = sprites;
								statements.push(result);
							});
						},
					},
					{
						ALT: () => statements.push($.SUBRULE($.entitiesLayerSprite)),
					},
				]);
			});

			$.CONSUME(tokens.CloseCurly);

			if (statements.length) sheet.statements = statements;
			return sheet;
		});
	}

	static entitiesLayerSprite($) {
		return $.RULE("entitiesLayerSprite", (options) => {
			$.CONSUME(tokens.Sprite);

			const result: Partial<TEntitiesLayerSprite> = {
				type: OP_TYPES.SPRITE,
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
					{
						ALT: () => {
							result.width = $.SUBRULE($.parm_width);
						},
					},
					{
						ALT: () => {
							result.height = $.SUBRULE($.parm_height);
						},
					},
				]);
			});

			if (!result.pos) throw new TypeError("Missing required prop 'at:'");

			return result;
		});
	}
}
