import { tokens } from "../../lexer";
import type { TActionList } from "./layout/action.rules";

export type TEventHandlerDef = { action: TActionList; args?: string[] };
export type TEventHandlerDict = Record<string, TEventHandlerDef>;
type TEventHandlersRecord = {
	name: "on";
	value: TEventHandlerDict;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class OnRules {
	static displayOnEvent($) {
		return $.RULE("displayOnEvent", (sheet): TEventHandlersRecord => {
			const handlers: TEventHandlerDict = sheet?.on ? sheet.on : {};
			const result: TEventHandlersRecord = { name: "on", value: handlers };

			$.CONSUME(tokens.On);

			const eventName = $.OR([{ ALT: () => $.CONSUME(tokens.StringLiteral).payload }, { ALT: () => $.CONSUME(tokens.Identifier).image }]);

			const args: string[] = [];
			$.OPTION(() => {
				$.MANY(() => {
					const varName = $.CONSUME(tokens.Variable).image.substring(1);
					(args as string[]).push(varName);
					$.variablesDict.set(varName, 0);
				});
			});

			const handlerDef: TEventHandlerDef = { action: $.SUBRULE($.layoutActionBlock) };
			handlers[eventName] = handlerDef;
			if (args.length) handlerDef.args = args;

			return result;
		});
	}
}
