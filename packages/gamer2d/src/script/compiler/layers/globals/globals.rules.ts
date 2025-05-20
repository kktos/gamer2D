import { tokens } from "../../lexer";
import type { TSet } from "../display/layout/set.rules";

export type TLayerGlobalsSheet = {
	type: "globals";
	variables: TSet[];
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class GlobalsLayerRules {
	static globalsLayerSheet($) {
		return $.RULE("globalsLayerSheet", () => {
			const sheet: TLayerGlobalsSheet = { type: "globals", variables: [] };

			$.CONSUME(tokens.Globals);
			$.CONSUME(tokens.OpenCurly);

			$.MANY(() => {
				sheet.variables.push($.SUBRULE($.layoutSet));
			});

			$.ACTION(() => {
				if (sheet.variables.length === 0) throw new TypeError("No variables defined in globals layer");
			});

			$.CONSUME(tokens.CloseCurly);

			return sheet;
		});
	}
}
