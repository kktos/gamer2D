import type { TLayerSheet } from "./layers/layer.rules";
import { SheetLexer } from "./lexer";
import { SheetParser } from "./parser";
import type { TSceneSheet } from "./scenes/scene.rules";

const parser = new SheetParser();

let wannaLogError = false;
export function setWannaLogError(value: boolean) {
	wannaLogError = value;
}

export function compile<T>(text: string, startRule: string, globals?: Map<string, unknown>, options?: unknown) {
	const lexingResult = SheetLexer.tokenize(text);
	parser.input = lexingResult.tokens;
	parser.variablesDict = globals ? globals : new Map();
	const result = parser[startRule](options);
	if (parser.errors.length > 0) {
		if (wannaLogError) console.error(parser.errors);
		const line = parser.errors[0].token.startLine;
		const word = parser.errors[0].token.image;
		throw new SyntaxError(`SYNTAX ERROR LINE ${line} at "${word}"`, { cause: parser.errors });
	}
	return result as T;
}

export const compileScript = (text: string, globals?: Map<string, unknown>, options?: unknown) => compile<TSceneSheet>(text, "sceneSheet", globals, options);
export const compileLayerScript = (text: string, globals?: Map<string, unknown>, options?: unknown) =>
	compile<TLayerSheet>(text, "layerSheet", globals, options);
