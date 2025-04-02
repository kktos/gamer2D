import { tokens } from "../lexer";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class DisplayRules {
	static displaySheet($) {
		return $.RULE("displaySheet", () => {
			$.CONSUME(tokens.Display);

			const sheet = { type: "display", name: $.CONSUME(tokens.StringLiteral).payload };

			$.CONSUME(tokens.OpenCurly);

			$.MANY(() => {
				const { name, value } = $.SUBRULE($.displayProps, { ARGS: [sheet] });
				sheet[name] = value;
			});

			$.CONSUME(tokens.CloseCurly);

			return sheet;
		});
	}

	static displayProps($) {
		return $.RULE("displayProps", (sheet) => {
			return $.OR([
				{ ALT: () => $.SUBRULE($.background) },
				{ ALT: () => $.SUBRULE($.showCursor) },
				{ ALT: () => $.SUBRULE($.font) },
				{ ALT: () => $.SUBRULE($.layout) },
				{ ALT: () => $.SUBRULE($.sound, { ARGS: [sheet] }) },
				{ ALT: () => $.SUBRULE($.displayTimer, { ARGS: [sheet] }) },
				{ ALT: () => $.SUBRULE($.displayOnEvent, { ARGS: [sheet] }) },
				{ ALT: () => $.SUBRULE($.displayUI) },
				{ ALT: () => $.SUBRULE($.displayLayers) },
			]);
		});
	}

	static displayLayers($) {
		return $.RULE("displayLayers", () => {
			$.CONSUME(tokens.Layers);

			$.CONSUME(tokens.OpenCurly);

			const result: { name: string; value: string[] } = { name: "layers", value: [] };

			$.AT_LEAST_ONE(() => {
				result.value.push($.CONSUME(tokens.Identifier).image);
			});

			$.CONSUME(tokens.CloseCurly);

			return result;
		});
	}
}
