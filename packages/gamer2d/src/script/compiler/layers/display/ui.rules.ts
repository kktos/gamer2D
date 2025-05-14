import { tokens } from "../../lexer";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class UIRules {
	static displayUI($) {
		return $.RULE("displayUI", () => {
			const result = {};

			$.CONSUME(tokens.UI);
			$.CONSUME(tokens.OpenCurly);

			$.AT_LEAST_ONE(() => {
				const { name, value } = $.OR([{ ALT: () => $.SUBRULE($.displayUIBackground) }, { ALT: () => $.SUBRULE($.displayUIPos) }]);
				result[name] = value;
			});

			$.CONSUME(tokens.CloseCurly);

			return { name: "ui", value: result };
		});
	}

	static displayUIBackground($) {
		return $.RULE("displayUIBackground", () => {
			$.CONSUME(tokens.Background);
			const value = $.SUBRULE($.htmlColor);
			return { name: "background", value };
		});
	}

	static displayUIPos($) {
		return $.RULE("displayUIPos", () => {
			$.CONSUME(tokens.Pos);
			const value = $.OR([{ ALT: () => $.CONSUME(tokens.Top) }, { ALT: () => $.CONSUME(tokens.Bottom) }]).image;
			return { name: "pos", value };
		});
	}
}
