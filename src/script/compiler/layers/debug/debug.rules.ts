import { tokens } from "../../lexer";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class DebugRules {
	static debugSheet($) {
		return $.RULE("debugSheet", () => {
			const sheet = { type: "debug", name: $.SUBRULE($.debugClause) };

			$.CONSUME(tokens.OpenCurly);

			// $.MANY(() => {
			// 	const {name,value}= $.SUBRULE(parser.displayProps);
			// 	sheet[name] = value;
			// });

			$.CONSUME(tokens.CloseCurly);

			return sheet;
		});
	}

	static debugClause($) {
		return $.RULE("debugClause", () => {
			$.CONSUME(tokens.Debug);
			return $.CONSUME(tokens.StringLiteral).payload;
		});
	}

	// $.RULE("displayProps", () => {
	// 	return $.OR([
	// 		{ ALT:() => $.SUBRULE(parser.background) },
	// 		{ ALT:() => $.SUBRULE(parser.showCursor) },
	// 		{ ALT:() => $.SUBRULE(parser.font) },
	// 		{ ALT:() => $.SUBRULE(parser.layout) }
	// 	]);
	// });

	// layoutRules(parser);
}
