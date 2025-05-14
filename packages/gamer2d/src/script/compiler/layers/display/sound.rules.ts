import { tokens } from "../../lexer";

export type TSoundDefs = Record<string, { play: boolean }>;
type TSoundDefsRecord = {
	name: "sounds";
	value: TSoundDefs;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class SoundRules {
	static sound($) {
		return $.RULE("sound", (sheet): TSoundDefsRecord => {
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
