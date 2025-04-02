import { tokens } from "../lexer";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class TimerRules {
	static displayTimer($) {
		return $.RULE("displayTimer", (sheet) => {
			$.CONSUME(tokens.Timer);

			const name = $.OPTION(() => $.CONSUME(tokens.StringLiteral).payload);

			$.CONSUME(tokens.MS);
			$.CONSUME(tokens.Colon);
			const time = $.SUBRULE($.number);

			const repeatCount = $.OPTION2(() => {
				let repeat = Number.POSITIVE_INFINITY;
				$.CONSUME(tokens.Repeat);
				$.OPTION3(() => {
					$.CONSUME2(tokens.Colon);
					repeat = $.SUBRULE2($.number);
				});
				return repeat;
			});

			const timers = sheet?.timers ? sheet.timers : {};
			timers[name] = { time, repeat: repeatCount };

			return { name: "timers", value: timers };
		});
	}
}
