import { tokens } from "../lexer";
/*
export function gameRules(parser) {
	const $ = parser;

	$.RULE("gameSheet", () => {
		const sheet = { type: "game" };
		sheet.name = $.SUBRULE(parser.gameClause);

		$.CONSUME(tokens.OpenCurly);

		// $.MANY(() => {
		// 	const {name,value}= $.SUBRULE(parser.displayProps);
		// 	sheet[name] = value;
		// });

		$.CONSUME(tokens.CloseCurly);

		return sheet;
	});

	$.RULE("gameClause", () => {
		$.CONSUME(tokens.Game);
		return $.CONSUME(tokens.StringLiteral).payload;
	});

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
*/

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class GameRules {
	static gameSheet($) {
		return $.RULE("gameSheet", () => {
			const sheet = { type: "game", name: $.SUBRULE($.gameClause) };

			$.CONSUME(tokens.OpenCurly);

			// $.MANY(() => {
			// 	const {name,value}= $.SUBRULE(parser.displayProps);
			// 	sheet[name] = value;
			// });

			$.CONSUME(tokens.CloseCurly);

			return sheet;
		});
	}

	static gameClause($) {
		return $.RULE("gameClause", () => {
			$.CONSUME(tokens.Game);
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
