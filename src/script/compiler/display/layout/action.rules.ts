import { tokens } from "../../lexer";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class ActionRules {
	static layoutAction($) {
		return $.RULE("layoutAction", () => {
			$.CONSUME(tokens.Action);
			$.CONSUME(tokens.Colon);

			return $.SUBRULE($.layoutActionBlock);
		});
	}
	static layoutActionBlock($) {
		return $.RULE("layoutActionBlock", () => {
			const result: unknown[] = [];

			$.CONSUME(tokens.OpenCurly);

			$.AT_LEAST_ONE(() => {
				result.push($.SUBRULE($.layoutActionStatement));
			});

			$.CONSUME(tokens.CloseCurly);

			return result;
		});
	}
	static layoutActionStatement($) {
		return $.RULE("layoutActionStatement", () => {
			const result: { name: string[] }[] = [];
			$.AT_LEAST_ONE_SEP({
				SEP: tokens.Dot,
				DEF: () => {
					result.push($.SUBRULE($.layoutActionFunctionCall));
				},
			});
			$.ACTION(() => {
				if (result[0].name.length === 1) result[0].name.unshift("SYSTEM");
			});
			return result;
		});
	}
	static layoutActionFunctionCall($) {
		return $.RULE("layoutActionFunctionCall", () => {
			const parts: unknown[] = [];
			$.AT_LEAST_ONE_SEP({
				SEP: tokens.Dot,
				DEF: () => {
					parts.push($.SUBRULE($.layoutActionFunctionName));
				},
			});

			const result: { name: unknown[]; args: unknown[] } = {
				name: parts,
				args: [],
			};

			$.CONSUME(tokens.OpenParent);

			const args = result.args;
			$.MANY_SEP({
				SEP: tokens.Comma,
				DEF: () => {
					$.OR([
						{ ALT: () => args.push($.SUBRULE($.number)) },
						{ ALT: () => args.push($.CONSUME2(tokens.Identifier).image) },
						{ ALT: () => args.push($.CONSUME2(tokens.Left).image) },
						{ ALT: () => args.push($.CONSUME2(tokens.Right).image) },
						{ ALT: () => args.push($.CONSUME2(tokens.Variable).image) },
						{ ALT: () => args.push($.CONSUME2(tokens.StringLiteral).image) },
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
