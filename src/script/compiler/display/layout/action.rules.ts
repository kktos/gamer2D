import { ArgColor, ArgIdentifier, ArgVariable } from "../../../../types/value.types";
import { tokens } from "../../lexer";

export type TFunctionArg = ArgVariable | ArgIdentifier | ArgColor | number | string;
type TFunctionCall = {
	name: string[];
	args: TFunctionArg[];
};

export type TActionList = TFunctionCall[][];

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ActionRules {
	static layoutAction($) {
		return $.RULE("layoutAction", () => {
			// action:
			$.CONSUME(tokens.Action);
			$.CONSUME(tokens.Colon);

			// { <statements> }
			return $.SUBRULE($.layoutActionBlock);
		});
	}

	static layoutActionBlock($) {
		return $.RULE("layoutActionBlock", (actionOptions) => {
			const result: TFunctionCall[][] = [];

			// {
			$.CONSUME(tokens.OpenCurly);
			// statements list
			$.AT_LEAST_ONE(() => {
				result.push($.SUBRULE($.layoutActionStatement, { ARGS: [actionOptions] }));
			});
			// }
			$.CONSUME(tokens.CloseCurly);

			return result;
		});
	}

	static layoutActionStatement($) {
		return $.RULE("layoutActionStatement", (actionOptions) => {
			const result: TFunctionCall[] = [];
			// <functionName>(...parms)[.<functionName>(...parms)][.<functionName>(...parms)]....
			// to allow something like sprite("Bubblun").set("mass", 0)
			$.AT_LEAST_ONE_SEP({
				SEP: tokens.Dot,
				DEF: () => {
					result.push($.SUBRULE($.layoutActionFunctionCall));
				},
			});
			$.ACTION(() => {
				if (!actionOptions?.noSystem && result[0].name.length === 1) result[0].name.unshift("SYSTEM");
			});
			return result;
		});
	}

	static layoutActionFunctionCall($) {
		return $.RULE("layoutActionFunctionCall", () => {
			const result: TFunctionCall = {
				name: [],
				args: [],
			};

			$.AT_LEAST_ONE_SEP({
				SEP: tokens.Dot,
				DEF: () => {
					result.name.push($.SUBRULE($.layoutActionFunctionName));
				},
			});

			$.CONSUME(tokens.OpenParent);

			const args = result.args;
			$.MANY_SEP({
				SEP: tokens.Comma,
				DEF: () => {
					$.OR([
						{ ALT: () => args.push($.SUBRULE($.number)) },
						{ ALT: () => args.push(new ArgIdentifier($.CONSUME2(tokens.Identifier).image)) },
						{ ALT: () => args.push(new ArgIdentifier($.CONSUME2(tokens.Left).image)) },
						{ ALT: () => args.push(new ArgIdentifier($.CONSUME2(tokens.Right).image)) },
						{ ALT: () => args.push(new ArgVariable($.CONSUME2(tokens.Variable).image.substring(1))) },
						{ ALT: () => args.push($.CONSUME2(tokens.StringLiteral).payload) },
						{ ALT: () => args.push(new ArgColor($.CONSUME2(tokens.HexNumber).image)) },
					]);
				},
			});

			$.CONSUME(tokens.CloseParent);

			return result;
		});
	}

	static layoutActionFunctionName($) {
		return $.RULE("layoutActionFunctionName", () => {
			return $.OR([
				{ ALT: () => $.CONSUME(tokens.Identifier).image },
				{ ALT: () => $.CONSUME(tokens.Timer).image },
				{ ALT: () => $.CONSUME(tokens.Sprite).image },
				{ ALT: () => $.CONSUME(tokens.Dir).image },
				{ ALT: () => $.CONSUME(tokens.Sound).image },
				{ ALT: () => $.CONSUME(tokens.Loop).image },
				{ ALT: () => $.CONSUME(tokens.Play).image },
				{ ALT: () => $.CONSUME(tokens.Text).image },
			]);
		});
	}
}
