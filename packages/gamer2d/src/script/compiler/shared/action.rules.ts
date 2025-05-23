import { ArgColor, ArgIdentifier, ArgVariable } from "../../../types/value.types";
import type { TSet } from "../layers/display/layout/set.rules";
import { tokens } from "../lexer";

export type TFunctionArg = ArgVariable | ArgIdentifier | ArgColor | number | string;
export type TFunctionCall = {
	name: string[];
	args: TFunctionArg[];
};
export type TActionStatement = TFunctionCall[] | TSet;
export type TActionList = TActionStatement[];

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ActionRules {
	static layoutAction($) {
		// TODO: should be moved to menu rules
		return $.RULE("layoutAction", () => {
			// action:
			$.CONSUME(tokens.Action);
			$.CONSUME(tokens.Colon);

			// { <statements> }
			return $.SUBRULE($.actionBlock);
		});
	}

	static actionBlock($) {
		return $.RULE("actionBlock", (actionOptions) => {
			const result: TActionStatement[] = [];

			// {
			$.CONSUME(tokens.OpenCurly);
			// statements list
			$.AT_LEAST_ONE(() => {
				result.push($.SUBRULE($.actionStatement, { ARGS: [actionOptions] }));
			});
			// }
			$.CONSUME(tokens.CloseCurly);

			return result;
		});
	}

	static actionStatement($) {
		return $.RULE("actionStatement", (actionOptions) => {
			const result: TFunctionCall[] | unknown = $.OR([
				{
					ALT: () => $.SUBRULE($.actionFunctionCallList, { ARGS: [actionOptions] }),
				},
				{
					ALT: () => $.SUBRULE($.layoutSet),
				},
			]);
			return result;
		});
	}

	static actionFunctionCallList($) {
		return $.RULE("actionFunctionCallList", (actionOptions) => {
			const calls: TFunctionCall[] = [];
			// <functionName>(...parms)[.<functionName>(...parms)][.<functionName>(...parms)]....
			// to allow something like sprite("Bubblun").set("mass", 0)
			$.AT_LEAST_ONE_SEP({
				SEP: tokens.Dot,
				DEF: () => {
					calls.push($.SUBRULE($.actionFunctionCall));
				},
			});
			$.ACTION(() => {
				if (!actionOptions?.noSystem && calls[0].name.length === 1) calls[0].name.unshift("SYSTEM");
			});
			return calls;
		});
	}

	static actionFunctionCall($) {
		return $.RULE("actionFunctionCall", () => {
			const result: TFunctionCall = {
				name: [],
				args: [],
			};

			$.AT_LEAST_ONE_SEP({
				SEP: tokens.Dot,
				DEF: () => {
					const name = $.SUBRULE($.actionFunctionName);
					$.ACTION(() => {
						if (typeof name === "string") result.name.push(name);
						else result.name.push(...name);
					});
				},
			});

			$.CONSUME(tokens.OpenParent);

			const args = result.args;
			$.MANY_SEP({
				SEP: tokens.Comma,
				DEF: () => {
					$.OR([
						{ ALT: () => args.push(new ArgIdentifier($.CONSUME2(tokens.Identifier).image)) },
						{ ALT: () => args.push(new ArgIdentifier($.CONSUME2(tokens.Left).image)) },
						{ ALT: () => args.push(new ArgIdentifier($.CONSUME2(tokens.Right).image)) },
						{ ALT: () => args.push($.SUBRULE($.expr)) },
						{ ALT: () => args.push($.CONSUME2(tokens.StringLiteral).payload) },
						{ ALT: () => args.push(new ArgColor($.CONSUME2(tokens.HexNumber).image)) },
					]);
				},
			});

			$.CONSUME(tokens.CloseParent);

			return result;
		});
	}

	static actionFunctionName($) {
		return $.RULE("actionFunctionName", () => {
			return $.OR([
				// TODO: should be a defined variable but as it is used in ON_EVENT....
				{
					ALT: () => {
						const name = $.CONSUME(tokens.Variable).image.substring(1);
						return $.ACTION(() => {
							const parts = name.split(".");
							if (parts.length > 1) return [new ArgVariable(parts[0]), ...parts.slice(1)];
							return [new ArgVariable(name)];
						});
					},
				},
				{ ALT: () => $.CONSUME(tokens.Identifier).image },
				{ ALT: () => $.CONSUME(tokens.Timer).image },
				{ ALT: () => $.CONSUME(tokens.Sprite).image },
				{ ALT: () => $.CONSUME(tokens.Dir).image },
				{ ALT: () => $.CONSUME(tokens.At).image },
				{ ALT: () => $.CONSUME(tokens.Sound).image },
				{ ALT: () => $.CONSUME(tokens.Loop).image },
				{ ALT: () => $.CONSUME(tokens.Play).image },
				{ ALT: () => $.CONSUME(tokens.Text).image },
				{ ALT: () => $.CONSUME(tokens.Entities).image },
				{ ALT: () => $.CONSUME(tokens.Trait).image },
				{ ALT: () => $.CONSUME(tokens.Traits).image },
				{ ALT: () => $.CONSUME(tokens.Spawn).image },
				{ ALT: () => $.CONSUME(tokens.Item).image },
				{ ALT: () => $.CONSUME(tokens.Keys).image },
			]);
		});
	}
}
