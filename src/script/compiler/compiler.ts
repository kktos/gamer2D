import { SheetLexer } from "./lexer";
import { SheetParser } from "./parser";

const parser = new SheetParser();

export function compileScript(text: string) {
	const lexingResult = SheetLexer.tokenize(text);
	parser.input = lexingResult.tokens;
	const result = parser.sheet();
	if (parser.errors.length > 0) {
		console.error("PARSE ERR", parser.errors);
		throw new Error("sad sad panda, Parsing errors detected");
	}
	return result;
}
