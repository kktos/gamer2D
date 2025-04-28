import { tokens } from "../../lexer";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class EditorRules {
	static editorSheet($) {
		return $.RULE("editorSheet", () => {
			$.CONSUME(tokens.Editor);

			const sheet = { type: "editor" };

			$.CONSUME(tokens.OpenCurly);

			// $.MANY(() => {
			// 	const {name,value}= $.SUBRULE($.displayProps);
			// 	sheet[name] = value;
			// });

			$.CONSUME(tokens.CloseCurly);

			return sheet;
		});
	}
}
