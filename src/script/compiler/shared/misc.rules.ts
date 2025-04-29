import { tokens } from "../lexer";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class MiscRules {
	static font($) {
		return $.RULE("font", () => {
			$.CONSUME(tokens.Font);
			const value = $.CONSUME(tokens.StringLiteral).payload;
			return { name: "font", value };
		});
	}
}
