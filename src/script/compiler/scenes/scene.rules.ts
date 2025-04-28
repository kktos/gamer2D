// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class SheetRules {
	static sheet($) {
		return $.RULE("sheet", () => {
			return $.OR([
				{ ALT: () => $.SUBRULE($.displaySheet) },
				{ ALT: () => $.SUBRULE($.gameSheet) },
				{ ALT: () => $.SUBRULE($.levelSheet) },
				{ ALT: () => $.SUBRULE($.editorSheet) },
				{ ALT: () => $.SUBRULE($.debugSheet) },
			]);
		});
	}
}
