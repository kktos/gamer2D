import { tokens } from "../../lexer";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class EditorRules {
	static editorSheet($) {
		return $.RULE("editorSheet", () => {
			const sheet = { type: "editor", name: $.SUBRULE($.editorClause) };

			$.CONSUME(tokens.OpenCurly);

			// $.MANY(() => {
			// 	const {name,value}= $.SUBRULE($.displayProps);
			// 	sheet[name] = value;
			// });

			$.CONSUME(tokens.CloseCurly);

			return sheet;
		});
	}

	static editorClause($) {
		return $.RULE("editorClause", () => {
			$.CONSUME(tokens.Editor);
			return $.CONSUME(tokens.StringLiteral).payload;
		});
	}

	// $.RULE("displayProps", () => {
	// 	return $.OR([
	// 		{ ALT:() => $.SUBRULE($.background) },
	// 		{ ALT:() => $.SUBRULE($.showCursor) },
	// 		{ ALT:() => $.SUBRULE($.font) },
	// 		{ ALT:() => $.SUBRULE($.layout) }
	// 	]);
	// });

	// layoutRules($);
}
