import { OP_TYPES } from "../../../../../types/operation.types";
import type { TupleToUnion } from "../../../../../types/typescript.types";
import type { ArgVariable } from "../../../../../types/value.types";
import { tokens } from "../../../lexer";

export type TView = {
	type: TupleToUnion<[typeof OP_TYPES.VIEW]>;
	name: string;
	view: string;
	pos: [number, number];
	width: number | ArgVariable;
	height: number | ArgVariable;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ViewRules {
	static layoutView($) {
		return $.RULE("layoutView", () => {
			$.CONSUME(tokens.View);

			const result: TView = {
				type: OP_TYPES.VIEW,
				name: $.CONSUME(tokens.StringLiteral).payload,
				view: $.SUBRULE($.layoutViewType),
				pos: $.SUBRULE($.parm_at),
				width: $.SUBRULE($.parm_width),
				height: $.SUBRULE($.parm_height),
			};

			return result;
		});
	}

	static layoutViewType($) {
		return $.RULE("layoutViewType", () => {
			$.CONSUME(tokens.Type);
			$.CONSUME(tokens.Colon);
			return $.CONSUME(tokens.Identifier).image;
		});
	}
}
