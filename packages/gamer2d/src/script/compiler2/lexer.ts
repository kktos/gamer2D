import { NeatLexerError } from "./lexerError";

const PATTERNS = [
	// C-style line Comments
	{ type: "COMMENT", regex: String.raw`\/\/[^\n\r]*` },

	// Function calls with string arguments
	// { type: "FUNCALL", regex: String.raw`[a-zA-Z_][a-zA-Z0-9_]*\((?:[^)"']|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')*\)` },

	// Units and numbers
	{ type: "DIMENSION", regex: String.raw`\d+x\d+` },
	{ type: "PIXEL", regex: String.raw`\d+px` },
	{ type: "SECONDS", regex: String.raw`\d+s` },
	{ type: "NUMBER", regex: String.raw`\d+\.\d+|\d+` },

	// Colors and strings
	{ type: "COLOR", regex: String.raw`#[a-fA-F0-9]{3,8}` },
	{ type: "STRING", regex: String.raw`"(?:\\.|(?:\${[^}]*})|[^"\\])*"` },

	// Identifiers and variables
	{ type: "VARIABLE", regex: String.raw`\$[a-zA-Z_][a-zA-Z0-9_]*` },
	{ type: "IDENTIFIER", regex: String.raw`[a-zA-Z_][a-zA-Z0-9_]*` },

	// symbols
	{ type: "PUNCT", regex: String.raw`[{}(),+\-/*=[\]:<>!%\.]` },
] as const;

export type TokenValueMap = {
	NUMBER: number;
	STRING: string;
	VARIABLE: string;
	IDENTIFIER: string;
	COLOR: string;
	DIMENSION: string;
	PIXEL: string;
	SECONDS: string;
	PUNCT: string;
	COMMENT: string;
	EOF: null;
};

export type TTokenType = (typeof PATTERNS)[number]["type"] | "EOF";
export type TNeatToken<T extends TTokenType = TTokenType> = {
	type: T;
	value: TokenValueMap[T];
	pos: [number, number];
	rawValue: string;
};

export class NeatLexer {
	tokens: TNeatToken[];
	current: number;
	positions: Map<string, unknown>;
	lines: string[];

	constructor() {
		this.tokens = [];
		this.lines = [];
		this.current = 0;
		this.positions = new Map();
	}

	tokenize(input: string) {
		const combined = PATTERNS.map((p) => `(?<${p.type}>${p.regex})`).join("|");
		const tokenRegex = new RegExp(combined, "g");

		this.lines = input.split("\n");
		this.tokens = [];
		this.positions = new Map();
		this.current = 0;

		for (let lineNum = 0; lineNum < this.lines.length; lineNum++) {
			const line = this.lines[lineNum];
			let lastIndex = 0;

			for (const match of line.matchAll(tokenRegex)) {
				const value = match[0];
				const column = match.index;

				// Find which group matched
				let type: TTokenType = "COMMENT";
				const groups = match.groups as Record<string, string>;
				for (const key of Object.keys(groups)) {
					if (groups[key] !== undefined) {
						type = key as TTokenType;
						break;
					}
				}

				// Skip comments
				if (type === "COMMENT") {
					lastIndex = line.length;
					break;
				}

				// Invalid chunk check (as before)
				if (column > lastIndex) NeatLexerError.checkInvalidChunk(line, lineNum + 1, lastIndex, column);

				const token: TNeatToken = { type, value, pos: [lineNum + 1, column + 1], rawValue: value };
				switch (type) {
					case "IDENTIFIER":
						token.value = value.toLowerCase();
						break;
					case "NUMBER":
						token.value = Number.parseFloat(value);
						break;
					case "STRING":
						token.value = value.slice(1, -1).replace(/\\([^\\])/g,"$1");
						break;
					case "VARIABLE":
						token.value = value.slice(1);
						break;
				}

				this.tokens.push(token);
				// this.positions.set(`${value}:${lineNum + 1}:${column + 1}`, {
				// 	value,
				// 	type,
				// 	pos: [lineNum + 1, column + 1],
				// });

				lastIndex = column + value.length;
			}

			if (lastIndex < line.length) NeatLexerError.checkInvalidChunk(line, lineNum + 1, lastIndex);
		}
	}

	getTokenPosition(token) {
		// Find the first matching position (since key is token:line:col)
		for (const [key, pos] of this.positions.entries()) {
			if (key.startsWith(`${token}:`)) return pos;
		}
		return undefined;
	}

	private createEofToken(): TNeatToken<"EOF"> {
		let eofLine = 1;
		let eofCol = 1;
		if (this.tokens.length > 0) {
			const lastToken = this.tokens[this.tokens.length - 1];
			eofLine = lastToken.pos[0];
			// Column after the last character of the last token
			eofCol = lastToken.pos[1] + lastToken.rawValue.length;
		} else if (this.lines && this.lines.length > 0) {
			// Handles cases like empty input or input with only comments
			eofLine = this.lines.length;
			eofCol = this.lines[this.lines.length - 1].length + 1;
			if (this.lines.length === 1 && this.lines[0] === "") {
				// Specifically for an empty input string
				eofLine = 1;
				eofCol = 1;
			}
		}
		return { type: "EOF", value: null, pos: [eofLine, eofCol], rawValue: "" };
	}

	peek(offset = 0): TNeatToken {
		const targetIndex = this.current + offset;
		if (targetIndex >= this.tokens.length || targetIndex < 0) return this.createEofToken();
		return this.tokens[targetIndex];
	}

	advance() {
		if (this.current >= this.tokens.length) return this.createEofToken();
		const tokenToReturn = this.tokens[this.current];
		this.current++;
		return tokenToReturn;
	}

	public is(expectedType: TTokenType | TTokenType[], expectedValue?: unknown | unknown[], offset = 0) {
		const token = this.peek(offset);
		const typeMatch = Array.isArray(expectedType) ? expectedType.includes(token.type) : token.type === expectedType;
		const valueMatch = expectedValue === undefined ? true : Array.isArray(expectedValue) ? expectedValue.includes(token.value) : token.value === expectedValue;

		return typeMatch && valueMatch;
	}

	public consume<T extends TTokenType>(expectedType: T, expectedValue?: TokenValueMap[T] | TokenValueMap[T][]): TNeatToken<T>;
	public consume(expectedType: TTokenType[], expectedValue?: unknown | unknown[]): TNeatToken;
	public consume<T extends TTokenType>(expectedType: T | TTokenType[], expectedValue?: unknown | unknown[]): TNeatToken<T> | TNeatToken {
		const token = this.peek();
		const typeMatch = Array.isArray(expectedType) ? expectedType.includes(token.type) : token.type === expectedType;
		const valueMatch = expectedValue === undefined ? true : Array.isArray(expectedValue) ? expectedValue.includes(token.value) : token.value === expectedValue;

		if (typeMatch && valueMatch) return this.advance();

		// Use your error handler as before
		// this.lexer.constructor["throwInvalidToken"]?.(this.lexer.lines, token, expectedType, expectedValue);
		// return { type: "EOF", value: null } as TNeatToken;

		NeatLexerError.throwInvalidToken(this.lines, token, Array.isArray(expectedType) ? expectedType.join(" or ") : expectedType, expectedValue);
		return { type: "EOF", value: null } as TNeatToken;
	}

	public expect(expectedType: TTokenType | TTokenType[], expectedValue?: unknown | unknown[]) {
		const token = this.peek();
		const typeMatch = Array.isArray(expectedType) ? expectedType.includes(token.type) : token.type === expectedType;
		const valueMatch = expectedValue === undefined ? true : Array.isArray(expectedValue) ? expectedValue.includes(token.value) : token.value === expectedValue;

		if (typeMatch && valueMatch) return true;
		// this.lexer.constructor["throwInvalidToken"]?.(this.lexer.lines, token, expectedType, expectedValue);
		NeatLexerError.throwInvalidToken(this.lines, token, Array.isArray(expectedType) ? expectedType.join(" or ") : expectedType, expectedValue);
	}
}
