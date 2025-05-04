import { SheetLexer } from "./lexer";
import { SheetParser } from "./parser";

const parser = new SheetParser();

let wannaLogError = false;
export function setWannaLogError(value: boolean) {
	wannaLogError = value;
}

export function compile(text: string, startRule: string, globals?: Map<string, unknown>) {
	const lexingResult = SheetLexer.tokenize(text);
	parser.input = lexingResult.tokens;
	parser.variablesDict = globals ? globals : new Map();
	const result = parser[startRule]();
	if (parser.errors.length > 0) {
		if (wannaLogError) console.error(parser.errors);
		const line = parser.errors[0].token.startLine;
		const word = parser.errors[0].token.image;
		throw new SyntaxError(`SYNTAX ERROR LINE ${line} at "${word}"`, { cause: parser.errors });
	}
	return result;
}

export const compileScript = (text: string, globals?: Map<string, unknown>) => compile(text, "sceneSheet", globals);
export const compileLayerScript = (text: string, globals?: Map<string, unknown>) => compile(text, "layerSheet", globals);
