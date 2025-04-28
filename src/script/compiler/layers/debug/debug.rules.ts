import { tokens } from "../../lexer";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class DebugRules {
	static debugSheet($) {
		return $.RULE("debugSheet", () => {
			$.CONSUME(tokens.Debug);

			const sheet = { type: "debug" };

			$.CONSUME(tokens.OpenCurly);

			// $.MANY(() => {
			// 	const {name,value}= $.SUBRULE(parser.displayProps);
			// 	sheet[name] = value;
			// });

			$.CONSUME(tokens.CloseCurly);

			return sheet;
		});
	}
}
