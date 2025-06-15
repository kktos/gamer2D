
class NeatLexerError extends Error {
    constructor(message, line, column, lineContent) {
        super(message);
        this.name = "NeatLexerError";
        this.line = line;
        this.column = column;
        this.lineContent = lineContent;
    }

    static checkInvalidChunk(line, lineNum, startCol, endCol) {
		const invalidChunk = line.slice(startCol, endCol);
        for (let i = 0; i < invalidChunk.length; i++) {
            const ch = invalidChunk[i];
            if (!/\s/.test(ch)) {
                NeatLexerError.throwInvalidChar(lineNum, startCol + 1 + i, line);
            }
        }
    }

    static throwInvalidChar(line, column, lineContent) {
        throw new NeatLexerError(
            `Invalid character at line ${line}, column ${column}\n` +
            NeatLexerError.generateErrorPointer(lineContent, column),
            line,
            column,
            lineContent
        );
    }

    static generateErrorPointer(line, column) {
        if (!line) return '';
        return line.replace(/\t/g, " ") + '\n' + ' '.repeat(column - 1) + '^';
    }
}

const PATTERNS = [
	// C-style line Comments
    { type: "COMMENT",    regex: String.raw`\/\/[^\n\r]*` },

	// Function calls with string arguments
    { type: "FUNCALL",    regex: String.raw`[a-zA-Z_][a-zA-Z0-9_]*\((?:[^)"']|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')*\)` },

	// Units and numbers
    { type: "DIMENSION",  regex: String.raw`\d+x\d+` },
    { type: "PIXEL",      regex: String.raw`\d+px` },
    { type: "SECONDS",    regex: String.raw`\d+s` },
    { type: "NUMBER",     regex: String.raw`\d+\.\d+|\d+` },

	// Colors and strings
    { type: "COLOR",      regex: String.raw`#[a-fA-F0-9]{3,6}` },
    { type: "STRING",     regex: String.raw`"(?:\\.|(?:\${[^}]*})|[^"\\$])*"` },

	// Identifiers and variables
    { type: "VARIABLE",   regex: String.raw`\$[a-zA-Z_][a-zA-Z0-9_]*` },
    { type: "IDENTIFIER", regex: String.raw`[a-zA-Z_][a-zA-Z0-9_]*` },

	// symbols
    { type: "PUNCT",      regex: String.raw`[{}(),+\-/*=[\]:<>!%\.]` }
];

class NeatLexer {
    constructor() {
        this.tokens = [];
		this.tokenTypes = [];
        this.current = 0;
		this.positions = new Map();
    }
    
	tokenize(input) {
		const combined = PATTERNS.map(p => `(?<${p.type}>${p.regex})`).join('|');
		const tokenRegex = new RegExp(combined, 'g');

		const lines = input.split('\n');
        this.tokens = [];
		this.tokenTypes = [];
        this.positions = new Map();
        this.current = 0;

        for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    let lastIndex = 0;

    for (const match of line.matchAll(tokenRegex)) {
        let value = match[0];
        const column = match.index;

        // Find which group matched
        let type = null;
        for (const key of Object.keys(match.groups)) {
            if (match.groups[key] !== undefined) {
                type = key;
                break;
            }
        }

        // Skip comments
        if (type === "COMMENT") {
            lastIndex = line.length;
            break;
        }

        // Invalid chunk check (as before)
        if (column > lastIndex) {
            NeatLexerError.checkInvalidChunk(line, lineNum + 1, lastIndex, column);
        }

		const token= {type, value};
		switch (type) {
			case "NUMBER":
				token.value= Number.parseFloat(value);
				break;
			case "STRING":
				token.value= value.slice(1, -1);
				break;
			case "VARIABLE":
				token.value= value.slice(1);
				break;
		}

        this.tokens.push(token);
        this.positions.set(value + ':' + (lineNum + 1) + ':' + (column + 1), {
            value,
            type,
            pos: [lineNum + 1, column + 1]
        });

        lastIndex = column + value.length;
    }

    if (lastIndex < line.length) {
        NeatLexerError.checkInvalidChunk(line, lineNum + 1, lastIndex);
    }
}

        return this.tokens;
    }

	getTokenPosition(token) {
		// Find the first matching position (since key is token:line:col)
		for (const [key, pos] of this.positions.entries()) {
			if (key.startsWith(token + ':')) return pos;
		}
		return undefined;
	}    

    peek() {
        return this.tokens[this.current];
    }
    
    consume() {
        return this.tokens[this.current++];
    }
    
    expect(token) {
        const current = this.consume();
        if (current !== token) {
            throw new Error(`Expected '${token}', got '${current}'`);
        }
        return current;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const scriptInput = document.getElementById('scriptInput');
    const parseButton = document.getElementById('parseButton');
    const outputTokens = document.getElementById('outputTokens');

    if (!scriptInput || !parseButton || !outputTokens) {
        console.error('One or more required HTML elements are missing.');
        return;
    }

    parseButton.addEventListener('click', () => {
        const scriptContent = scriptInput.value;
        const parser = new NeatLexer();
        
        try {
            const tokens = parser.tokenize(scriptContent);

            // outputTokens.textContent = JSON.stringify(tokens.map(token => ({
            //     value: token,
            //     ...parser.getTokenPosition(token)
            // })), null, 2);

            outputTokens.textContent = JSON.stringify(tokens, null, 2);

        } catch (error) {
            outputTokens.innerHTML = `<pre style="color: red">Error parsing script:
${error.message}</pre>`;
        }
    });
});