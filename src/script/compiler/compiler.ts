import { SheetLexer } from "./lexer";
import { SheetParser } from "./parser";

const parser = new SheetParser();

function compile(text: string, startRule: string, globals?: Map<string, unknown>) {
	const lexingResult = SheetLexer.tokenize(text);
	parser.input = lexingResult.tokens;
	parser.variablesDict = globals ? globals : new Map();
	const result = parser[startRule]();
	if (parser.errors.length > 0) {
		console.error("PARSE ERR", parser.errors);
		throw new Error("PARSE ERR");
	}
	return result;
}

export const compileScript = (text: string, globals?: Map<string, unknown>) => compile(text, "sceneSheet", globals);
export const compileLayerScript = (text: string, globals?: Map<string, unknown>) => compile(text, "layerSheet", globals);
