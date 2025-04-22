import type { Entity } from "../../../../entities/Entity";
import type { BBox } from "../../../../maths/math";
import type { DIRECTIONS } from "../../../../types/direction.type";
import { OP_TYPES } from "../../../../types/operation.types";
import type { TupleToUnion } from "../../../../types/typescript.types";
import { tokens } from "../../lexer";

export type TSprite = {
	type: TupleToUnion<[typeof OP_TYPES.SPRITE]>;
	sprite: string;
	id?: string;
	pos: [number, number];
	zoom: number;
	range?: [number, number];
	dir?: TupleToUnion<[typeof DIRECTIONS.LEFT, typeof DIRECTIONS.RIGHT]>;

	bbox?: () => BBox;
	entity?: Entity;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class SpriteRules {
	static layoutSprite($) {
		return $.RULE("layoutSprite", (options) => {
			$.CONSUME(tokens.Sprite);

			let id: string;
			$.OPTION(() => {
				$.CONSUME(tokens.ID);
				$.CONSUME2(tokens.Colon);
				id = $.CONSUME3(tokens.StringLiteral).payload;
			});

			const result: TSprite = {
				type: OP_TYPES.SPRITE,
				sprite: $.CONSUME(tokens.StringLiteral).payload,
				zoom: options?.zoom ?? 1,
				pos: $.SUBRULE($.parm_at),
			};

			$.OPTION2(() => {
				result.range = $.SUBRULE($.parm_range);
			});

			$.OPTION3(() => {
				result.dir = $.SUBRULE($.parm_dir);
			});

			if (id) result.id = id;

			return result;
		});
	}
}
