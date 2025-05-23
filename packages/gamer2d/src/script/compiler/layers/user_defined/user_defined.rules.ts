import { tokens } from "../../lexer";

export type TLayerUserDefinedSheet = {
	name?: string;
	type: string;
	settings?: Record<string, unknown>;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class UserDefinedLayerRules {
	static userDefinedLayerSheet($) {
		return $.RULE("userDefinedLayerSheet", () => {
			const type = $.CONSUME(tokens.Identifier).image;

			const sheet: TLayerUserDefinedSheet = { type };

			$.CONSUME(tokens.OpenCurly);

			$.OPTION(() => {
				const settings = $.SUBRULE($.settingsStatements);
				if (Object.keys(settings).length) sheet.settings = settings;
			});

			$.CONSUME(tokens.CloseCurly);

			return sheet;
		});
	}
}
