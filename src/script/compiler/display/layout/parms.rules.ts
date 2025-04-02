import { DIRECTIONS } from "../../../types/direction.type";
import { tokens } from "../../lexer";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ParmsRules {
	static parm_at($) {
		return $.RULE("parm_at", () => {
			$.CONSUME(tokens.At);
			$.CONSUME(tokens.Colon);

			const x = $.SUBRULE($.numOrVar);

			$.CONSUME(tokens.Comma);

			const y = $.SUBRULE2($.numOrVar);

			return [x, y];
		});
	}
	static parm_range($) {
		return $.RULE("parm_range", () => {
			$.CONSUME(tokens.Range);
			$.CONSUME(tokens.Colon);
			const x = $.SUBRULE($.number);
			$.CONSUME(tokens.Comma);
			const y = $.SUBRULE2($.number);
			return [x, y];
		});
	}
	static parm_dir($) {
		return $.RULE("parm_dir", () => {
			$.CONSUME(tokens.Dir);
			$.CONSUME(tokens.Colon);

			return $.OR([
				{
					ALT: () => {
						$.CONSUME(tokens.Left);
						return DIRECTIONS.LEFT;
					},
				},
				{
					ALT: () => {
						$.CONSUME(tokens.Right);
						return DIRECTIONS.RIGHT;
					},
				},
			]);
		});
	}
}
