import { tokens } from "../../lexer";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class MiscRules {
	static font($) {
		return $.RULE("font", () => {
			$.CONSUME(tokens.Font);
			const value = $.CONSUME(tokens.StringLiteral).payload;
			return { name: "font", value };
		});
	}

	static background($) {
		return $.RULE("background", () => {
			$.CONSUME(tokens.Background);
			const value = $.OR([{ ALT: () => $.SUBRULE($.number) }, { ALT: () => $.SUBRULE($.htmlColor) }]);
			return { name: "background", value };
		});
	}

	static showCursor($) {
		return $.RULE("showCursor", () => {
			$.CONSUME(tokens.ShowCursor);
			return { name: "showCursor", value: true };
		});
	}
}
