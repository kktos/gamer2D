import { SheetLexer } from "./lexer";
import { SheetParser } from "./parser";

const parser = new SheetParser();

export function compileScript(text: string, globals?: Map<string, unknown>) {
	const lexingResult = SheetLexer.tokenize(text);
	parser.input = lexingResult.tokens;
	parser.variablesDict = globals ? globals : new Map();
	const result = parser.sheet();
	if (parser.errors.length > 0) {
		console.error("PARSE ERR", parser.errors);
		throw new Error("sad sad panda, Parsing errors detected");
	}
	return result;
}
