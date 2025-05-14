import { tokens } from "../../lexer";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class GameRules {
	static gameLayerSheet($) {
		return $.RULE("gameLayerSheet", () => {
			$.CONSUME(tokens.Game);
			// const sheet = { type: "game", name: $.SUBRULE($.gameClause) };
			const sheet = { type: "game" };

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
