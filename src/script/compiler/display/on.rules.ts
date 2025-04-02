import { tokens } from "../lexer";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class OnRules {
	static displayOnEvent($) {
		return $.RULE("displayOnEvent", (sheet) => {
			$.CONSUME(tokens.On);

			const eventName = $.OR([{ ALT: () => $.CONSUME(tokens.StringLiteral).payload }, { ALT: () => $.CONSUME(tokens.Identifier).image }]);
			const handlers = sheet?.on ? sheet.on : {};
			handlers[eventName] = { action: $.SUBRULE($.layoutActionBlock) };

			return { name: "on", value: handlers };
		});
	}
}
