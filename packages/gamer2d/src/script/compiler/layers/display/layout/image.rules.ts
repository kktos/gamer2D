import { OP_TYPES } from "../../../../../types/operation.types";
import type { TupleToUnion } from "../../../../../types/typescript.types";
import type { BBox } from "../../../../../utils/maths/BBox.class";
import { tokens } from "../../../lexer";

export type TImage = {
	type: TupleToUnion<[typeof OP_TYPES.IMAGE]>;
	name: string;
	pos: [number, number];
	zoom?: number;
	range?: [number, number];

	bbox: () => BBox;
};
// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ImageRules {
	static layoutImage($) {
		return $.RULE("layoutImage", (options) => {
			$.CONSUME(tokens.Image);

			const result: Partial<TImage> = {
				type: OP_TYPES.IMAGE,
				name: $.CONSUME(tokens.StringLiteral).payload,
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
