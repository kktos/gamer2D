import { NeatLexer, type TNeatToken, type TTokenType, type TokenValueMap } from "./lexer";
import { NeatLexerError } from "./lexerError";

export type NeatParserRuleHandler = (parser: NeatParser) => unknown;

export class NeatParser {
	lexer: NeatLexer;
	private rules: Map<string, NeatParserRuleHandler>;

	constructor() {
		this.lexer = new NeatLexer();
		this.rules = new Map();
	}

	public addRule(name: string, handler: NeatParserRuleHandler) {
		if (this.rules.has(name)) console.warn(`Parser rule "${name}" is being redefined.`);
		this.rules.set(name, handler);
	}

	public invokeRule<T>(name: string): T {
		const handler = this.rules.get(name);
		if (!handler) throw new Error(`Parser rule "${name}" not found.`);
		return handler(this) as T;
	}

	public parse(text: string, startRule: string) {
		this.lexer.tokenize(text);

		if (!this.rules.has(startRule)) throw new Error(`Start rule "${startRule}" not defined in parser.`);

		try {
			const result = this.invokeRule(startRule);
			/*
		const lastToken = this.lexer.peek();
		if (lastToken && lastToken.type !== "EOF") {
			// NeatParserError.throwUnexpectedToken(this.lexer.lines, lastToken, "end of script");
			throw new Error(`expected end of script !?! ${lastToken.type} ${lastToken.value}`);
		}
*/
			return result;
		} catch (e) {
			NeatLexerError.throwInvalidToken(this.lexer.lines, this.lexer.peek(), (e as Error).message, null);
		}
	}

	public consume<T extends TTokenType>(expectedType: T, expectedValue?: TokenValueMap[T] | TokenValueMap[T][]): TNeatToken<T>;
	public consume(expectedType: TTokenType[], expectedValue?: unknown | unknown[]): TNeatToken;
	public consume(expectedType: TTokenType | TTokenType[], expectedValue?: unknown | unknown[]): TNeatToken {
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		return this.lexer.consume(expectedType as any, expectedValue);
	}

	public identifier(expected?: string | string[]): string {
		const token = expected ? this.consume("IDENTIFIER", expected) : this.consume("IDENTIFIER");
		return token.value as string;
	}

	public variable() {
		return this.lexer.consume("VARIABLE").value;
	}

	public string() {
		return this.lexer.consume("STRING").value;
	}

	public number() {
		return this.lexer.consume("NUMBER").value;
	}

	public color() {
		return this.lexer.consume("COLOR").value;
	}

	public boolean() {
		const value = this.lexer.consume("IDENTIFIER", ["true", "false", "on", "off"]).value;
		return value === "true" || value === "on";
	}

	public advance(): TNeatToken {
		return this.lexer.advance();
	}

	public peek(offset = 0): TNeatToken {
		return this.lexer.peek(offset);
	}

	public peekValue(offset = 0) {
		return this.lexer.peek(offset).value;
	}

	public expect(expectedType: TTokenType | TTokenType[], expectedValue?: unknown | unknown[]) {
		return this.lexer.expect(expectedType, expectedValue);
	}

	public is(expectedType: TTokenType | TTokenType[], expectedValue?: unknown | unknown[]) {
		return this.lexer.is(expectedType, expectedValue);
	}

	public isIdentifier(expectedValue?: unknown | unknown[]) {
		return this.lexer.is("IDENTIFIER", expectedValue);
	}

	public isString() {
		return this.lexer.is("STRING");
	}

	public isBoolean() {
		return this.lexer.is("IDENTIFIER", ["true", "false", "on", "off"]);
	}

	public isLookahead(expectedType: TTokenType | TTokenType[], expectedValue?: unknown | unknown[]): boolean {
		return this.lexer.is(expectedType, expectedValue, 1);
	}
}
