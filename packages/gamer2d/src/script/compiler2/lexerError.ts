import type { TNeatToken } from "./lexer";

export class NeatLexerError extends Error {
	private line: number;
	private column: number;
	private lineContent: string;

	constructor(message: string, line: number, column: number, lineContent: string) {
		super(message);
		this.name = "NeatLexerError";
		this.line = line;
		this.column = column;
		this.lineContent = lineContent;
	}

	static checkInvalidChunk(lineContent: string, lineNum: number, startCol: number, endCol?: number) {
		const invalidChunk = lineContent.slice(startCol, endCol);
		for (let i = 0; i < invalidChunk.length; i++) {
			const ch = invalidChunk[i];
			if (!/\s/.test(ch)) NeatLexerError.throwInvalidChar(lineNum, startCol + 1 + i, lineContent);
		}
	}

	static throwInvalidChar(line: number, column: number, lineContent: string) {
		throw new NeatLexerError(
			`Invalid character at line ${line}, column ${column}\n${NeatLexerError.generateErrorPointer(lineContent, column)}`,
			line,
			column,
			lineContent,
		);
	}

	static throwInvalidToken(lines: string[], token: TNeatToken, type: string, value: unknown) {
		const lineContent = lines[token.pos[0] - 1];
		throw new NeatLexerError(
			`Invalid token at line ${token.pos[0]}, column ${token.pos[1]}\nExpecting ${type} ${value}\n${NeatLexerError.generateErrorPointer(lineContent, token.pos[1])}`,
			token.pos[0],
			token.pos[1],
			lineContent,
		);
	}

	static generateErrorPointer(lineContent: string, column: number) {
		if (!lineContent) return "";
		return `${lineContent.replace(/\t/g, " ")}\n${" ".repeat(column - 1)}^`;
	}
}
