import { OP_TYPES } from "../../../../../types/operation.types";
import type { TupleToUnion } from "../../../../../types/typescript.types";
import type { ArgVariable } from "../../../../../types/value.types";
import { tokens } from "../../../lexer";

export type TView = {
	type: TupleToUnion<[typeof OP_TYPES.VIEW]>;
	id: string;
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

			const result: Partial<TView> = {
				type: OP_TYPES.VIEW,
				view: $.CONSUME(tokens.Identifier).image,
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

			$.ACTION(() => {
				if (!("pos" in result)) throw new TypeError("Missing required prop 'at:'");
				if (!("width" in result)) throw new TypeError("Missing required prop 'width:'");
				if (!("height" in result)) throw new TypeError("Missing required prop 'height:'");
				if (!("id" in result)) throw new TypeError("Missing required prop 'id:'");
			});

			return result;
		});
	}
}
