import { tokens } from "../lexer";
/*
export function soundRules(parser) {
	const $ = parser;

	$.RULE("sound", (sheet) => {
		$.CONSUME(tokens.Sound);
		const sounds = sheet?.sounds ? sheet.sounds : {};
		const name = $.CONSUME(tokens.StringLiteral).payload;
		sounds[name] = {
			play: false,
		};
		$.OPTION(() => {
			sounds[name].play = !!$.CONSUME(tokens.Play);
		});
		return { name: "sounds", value: sounds };
	});
}
*/

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class SoundRules {
	static sound($) {
		return $.RULE("sound", (sheet) => {
			$.CONSUME(tokens.Sound);
			const sounds = sheet?.sounds ? sheet.sounds : {};
			const name = $.CONSUME(tokens.StringLiteral).payload;
			sounds[name] = {
				play: false,
			};
			$.OPTION(() => {
				sounds[name].play = !!$.CONSUME(tokens.Play);
			});
			return { name: "sounds", value: sounds };
		});
	}
}
