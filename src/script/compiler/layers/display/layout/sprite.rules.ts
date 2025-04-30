import type { Entity } from "../../../../../entities/Entity";
import type { BBox } from "../../../../../maths/math";
import type { DIRECTIONS } from "../../../../../types/direction.type";
import { OP_TYPES } from "../../../../../types/operation.types";
import type { TupleToUnion } from "../../../../../types/typescript.types";
import type { ArgVariable } from "../../../../../types/value.types";
import { tokens } from "../../../lexer";

export type TSprite = {
	type: TupleToUnion<[typeof OP_TYPES.SPRITE]>;
	sprite: string;
	id?: string;
	pos: [number, number];
	zoom: number;
	range?: [number, number];
	dir?: TupleToUnion<[typeof DIRECTIONS.LEFT, typeof DIRECTIONS.RIGHT]>;
	anim?: { name: string };
	traits?: ArgVariable[] | ArgVariable;

	bbox: () => BBox;
	entity?: Entity;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class SpriteRules {
	static layoutSprite($) {
		return $.RULE("layoutSprite", (options) => {
			$.CONSUME(tokens.Sprite);

			const result: Partial<TSprite> = {
				type: OP_TYPES.SPRITE,
				sprite: $.CONSUME(tokens.StringLiteral).payload,
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
							const { name, value, isParm } = $.SUBRULE($.textSpriteProps);
							$.ACTION(() => {
								if (!isParm) options[name] = value;
								else result[name] = value;
							});
						},
					},
				]);
			});

			if (!result.pos) throw new TypeError("Missing required prop 'at:'");

			return result;
		});
	}
}
