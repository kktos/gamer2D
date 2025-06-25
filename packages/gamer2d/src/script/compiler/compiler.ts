import type { IRecognitionException } from "chevrotain";
import type { TLayerSheet } from "./layers/layer.rules";
import { SheetLexer } from "./lexer";
import { SheetParser } from "./parser";
import type { TSpriteSheet } from "./ressources/spritesheet.rules";
import type { TSceneSheet } from "./scenes/scene.rules";

export class CompileSyntaxErr extends SyntaxError {
	line: number;
	word: string;
	text: string;
	filename?: string;
	ruleStack: string[];

	constructor(_errors: IRecognitionException[], src: string, errMsg?: string) {
		super(errMsg ?? parser.errors[0].message);
		this.line = parser.errors[0].token.startLine ?? -1;
		this.word = parser.errors[0].token.image;
		this.ruleStack = parser.errors[0].context.ruleStack;
		this.text = src;
	}
}

const parser = new SheetParser();

let wannaLogError = false;
export function setWannaLogError(value: boolean) {
	wannaLogError = value;
}

export function oldCompile<T>(text: string, startRule: string, globals?: Map<string, unknown>, options?: unknown) {
	const lexingResult = SheetLexer.tokenize(text);
	parser.input = lexingResult.tokens;
	parser.variablesDict = globals ? globals : new Map();
	let result: SheetParser | undefined;
	let errMsg: string | undefined;
	try {
		result = parser[startRule](options);
	} catch (e) {
		errMsg = (e as Error).message;
	}
	if (parser.errors.length > 0) {
		if (wannaLogError) console.error(parser.errors);
		throw new CompileSyntaxErr(parser.errors, text, errMsg);
	}
	return result as T;
}

export const compileScript = (text: string, globals?: Map<string, unknown>, options?: unknown) => oldCompile<TSceneSheet>(text, "sceneSheet", globals, options);
export const compileLayerScript = (text: string, globals?: Map<string, unknown>, options?: unknown) =>
	oldCompile<TLayerSheet>(text, "layerSheet", globals, options);

export const compileSpriteSheetScript = (filename: string, text: string, globals?: Map<string, unknown>, options?: unknown) => {
	try {
		return oldCompile<TSpriteSheet>(text, "spriteSheet", globals, options);
	} catch (e) {
		if (e instanceof CompileSyntaxErr) {
			e.filename = filename;
		}
		throw e;
	}
};
