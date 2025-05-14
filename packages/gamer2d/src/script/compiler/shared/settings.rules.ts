import { tokens } from "../lexer";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class SettingsRules {
	static settingsBlock($) {
		return $.RULE("settingsBlock", (settingsOptions) => {
			$.CONSUME(tokens.Settings);

			$.CONSUME(tokens.OpenCurly);

			const result = {
				name: "settings",
				value: $.SUBRULE($.settingsStatements),
			};

			$.CONSUME(tokens.CloseCurly);

			return settingsOptions?.onlyValue ? result.value : result;
		});
	}
	static settingsStatements($) {
		return $.RULE("settingsStatements", () => {
			const settings = {};
			$.MANY(() => {
				const name = $.CONSUME(tokens.Identifier).image;

				$.CONSUME(tokens.Equal);

				const value = $.SUBRULE($.layoutSetValue);

				settings[name] = value;
			});

			return settings;
		});
	}
}
