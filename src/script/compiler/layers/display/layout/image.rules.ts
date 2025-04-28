import { OP_TYPES } from "../../../../../types/operation.types";
import type { TupleToUnion } from "../../../../../types/typescript.types";
import { tokens } from "../../../lexer";

export type TImage = {
	type: TupleToUnion<[typeof OP_TYPES.IMAGE]>;
	sprite: string;
	pos: [number, number];
	zoom?: number;
	range?: [number, number];
};
// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ImageRules {
	static layoutImage($) {
		return $.RULE("layoutImage", (options) => {
			$.CONSUME(tokens.Image);

			const result: TImage = {
				type: OP_TYPES.IMAGE,
				sprite: $.CONSUME(tokens.StringLiteral).payload,
				pos: $.SUBRULE($.parm_at),
			};
			if (options?.zoom) {
				result.zoom = options.zoom;
			}

			$.OPTION(() => {
				result.range = $.SUBRULE($.parm_range);
			});

			return result;
		});
	}
}
