import type { Entity } from "../../../../../entities/Entity";
import type { BBox } from "../../../../../maths/math";
import type { DIRECTIONS } from "../../../../../types/direction.type";
import { OP_TYPES } from "../../../../../types/operation.types";
import type { TupleToUnion } from "../../../../../types/typescript.types";
import type { ArgExpression, ArgVariable } from "../../../../../types/value.types";
import { tokens } from "../../../lexer";

/**
	pool "bubblun:life" id:"lifePool" at:0,460 count:10 spawn:$bubblun.lives

*/

export type TPool = {
	type: TupleToUnion<[typeof OP_TYPES.POOL]>;
	sprite: string;
	count: number | ArgVariable | ArgExpression;
	spawn: number | ArgVariable | ArgExpression;
	pos: [number | ArgVariable | ArgExpression, number | ArgVariable | ArgExpression];
	id?: string;
	zoom: number;
	range?: [number | ArgVariable | ArgExpression, number | ArgVariable | ArgExpression];
	dir?: TupleToUnion<[typeof DIRECTIONS.LEFT, typeof DIRECTIONS.RIGHT]>;
	anim?: { name: string };
	traits?: ArgVariable[] | ArgVariable;

	bbox: () => BBox;
	entity?: Entity;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class EntityPoolRules {
	static layoutPool($) {
		return $.RULE("layoutPool", (options) => {
			$.CONSUME(tokens.Pool);

			const result: Partial<TPool> = {
				type: OP_TYPES.POOL,
				sprite: $.CONSUME(tokens.StringLiteral).payload,
			};

			$.MANY(() => {
				$.OR([
					{
						ALT: () => {
							$.CONSUME(tokens.ID);
							$.CONSUME(tokens.Colon);
							result.id = $.CONSUME3(tokens.StringLiteral).payload;
						},
					},
					{
						ALT: () => {
							$.CONSUME(tokens.Count);
							$.CONSUME2(tokens.Colon);
							result.count = $.SUBRULE($.expr);
						},
					},
					{
						ALT: () => {
							$.CONSUME(tokens.Spawn);
							$.CONSUME3(tokens.Colon);
							result.spawn = $.SUBRULE2($.expr);
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
			if (!result.count) throw new TypeError("Missing required prop 'count:'");

			return result;
		});
	}
}
