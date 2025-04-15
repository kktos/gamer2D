import { b } from "vitest/dist/chunks/suite.d.FvehnV49";
import { tokens } from "../../lexer";

export class ArgVariable {
	public value: string;
	constructor(value: string) {
		this.value = value;
	}
}
export class ArgIdentifier {
	public value: string;
	constructor(value: string) {
		this.value = value;
	}
}
export class ArgColor {
	public value: string;
	constructor(value: string) {
		this.value = value;
	}
	get rgba() {
		const m = this.value.match(/#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?/);
		return { r: Number.parseInt(m[1], 16), g: Number.parseInt(m[2], 16), b: Number.parseInt(m[3], 16), a: Number.parseInt(m[4], 16) || 255 };
	}
	add(other: ArgColor) {
		const { r: r1, g: g1, b: b1, a: a1 } = this.rgba;
		const { r: r2, g: g2, b: b2, a: a2 } = other.rgba;
		const hex = (s: number) => s.toString(16).padStart(2, "0");
		return `#${hex(r1 + r2)}${hex(g1 + g2)}${hex(b1 + b2)}${hex(a1 + a2)}`;
	}
}

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
			$.CONSUME(tokens.Action);
			$.CONSUME(tokens.Colon);

			return $.SUBRULE($.layoutActionBlock);
		});
	}
	static layoutActionBlock($) {
		return $.RULE("layoutActionBlock", (actionOptions) => {
			const result: TFunctionCall[][] = [];

			$.CONSUME(tokens.OpenCurly);

			$.AT_LEAST_ONE(() => {
				result.push($.SUBRULE($.layoutActionStatement, { ARGS: [actionOptions] }));
			});

			$.CONSUME(tokens.CloseCurly);

			return result;
		});
	}
	static layoutActionStatement($) {
		return $.RULE("layoutActionStatement", (actionOptions) => {
			const result: TFunctionCall[] = [];
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
