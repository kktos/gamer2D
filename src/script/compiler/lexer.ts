import { type ITokenConfig, Lexer, type TokenType, createToken } from "chevrotain";

type RegExpExecArrayWithPayload = RegExpExecArray & { payload: string };

// We define the regExp only **once** (outside) to avoid performance issues.
const stringLiteralPattern = /"(?:[^\\"]|\\(?:[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/y;
function matchStringLiteral(text, startOffset) {
	// using 'y' sticky flag (Note it is not supported on IE11...)
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/sticky
	stringLiteralPattern.lastIndex = startOffset;

	// Note that just because we are using a custom token pattern
	// Does not mean we cannot implement it using JavaScript Regular Expressions...
	const execResult = stringLiteralPattern.exec(text) as RegExpExecArrayWithPayload | null;
	if (execResult !== null) {
		const fullMatch = execResult[0];
		// compute the payload
		const matchWithOutQuotes = fullMatch.substring(1, fullMatch.length - 1);
		// attach the payload
		execResult.payload = matchWithOutQuotes;
	}

	return execResult;
}

type TokenDef = {
	pattern: RegExp | string | ((text: string, startOffset: number) => RegExpExecArray | null);
	longer_alt?: string | ITokenConfig;
	line_breaks?: boolean;
	group?: string;
	categories?: string | TokenType;
};
type TokenDefs = Record<string, TokenDef>;

const tokenDefs: TokenDefs = {
	Identifier: { pattern: /[a-zA-Z_]\w*/ },
	// Variable: { pattern: /\$[a-zA-Z]\w*/ },
	Variable: { pattern: /\$[a-zA-Z]\w*(\.\$?\w+)*/ },

	Display: { pattern: "display", longer_alt: "Identifier" },
	Game: { pattern: "game", longer_alt: "Identifier" },
	Level: { pattern: "level", longer_alt: "Identifier" },
	Debug: { pattern: "debug", longer_alt: "Identifier" },
	Editor: { pattern: "editor", longer_alt: "Identifier" },
	Entities: { pattern: "entities", longer_alt: "Identifier" },
	Globals: { pattern: "globals", longer_alt: "Identifier" },

	Background: { pattern: "background", longer_alt: "Identifier" },
	ShowCursor: { pattern: "showCursor", longer_alt: "Identifier" },
	Timer: { pattern: "timer", longer_alt: "Identifier" },
	Font: { pattern: "font", longer_alt: "Identifier" },
	Layout: { pattern: "layout", longer_alt: "Identifier" },
	Layer: { pattern: "layer", longer_alt: "Identifier" },

	Align: { pattern: "align", longer_alt: "Identifier" },
	VAlign: { pattern: "valign", longer_alt: "Identifier" },
	Size: { pattern: "size", longer_alt: "Identifier" },
	Zoom: { pattern: "zoom", longer_alt: "Identifier" },
	Color: { pattern: "color", longer_alt: "Identifier" },
	Var: { pattern: "var", longer_alt: "Identifier" },
	At: { pattern: "at", longer_alt: "Identifier" },
	Dir: { pattern: "dir", longer_alt: "Identifier" },
	Range: { pattern: "range", longer_alt: "Identifier" },
	Action: { pattern: "action", longer_alt: "Identifier" },
	Anim: { pattern: "anim", longer_alt: "Identifier" },
	Path: { pattern: "path", longer_alt: "Identifier" },
	Speed: { pattern: "speed", longer_alt: "Identifier" },
	ID: { pattern: "id", longer_alt: "Identifier" },
	Count: { pattern: "count", longer_alt: "Identifier" },
	Spawn: { pattern: "spawn", longer_alt: "Identifier" },

	Text: { pattern: "text", longer_alt: "Identifier" },
	Sprite: { pattern: "sprite", longer_alt: "Identifier" },
	Pool: { pattern: "pool", longer_alt: "Identifier" },
	Traits: { pattern: "traits", longer_alt: "Identifier" },
	Trait: { pattern: "trait", longer_alt: "Identifier" },
	Image: { pattern: "image", longer_alt: "Identifier" },
	Menu: { pattern: "menu", longer_alt: "Identifier" },
	View: { pattern: "view", longer_alt: "Identifier" },
	Rect: { pattern: "rect", longer_alt: "Identifier" },
	Sound: { pattern: "sound", longer_alt: "Identifier" },
	Play: { pattern: "play", longer_alt: "Identifier" },
	Loop: { pattern: "loop", longer_alt: "Identifier" },

	Items: { pattern: "items", longer_alt: "Identifier" },
	Item: { pattern: "item", longer_alt: "Identifier" },
	Selection: { pattern: "selection", longer_alt: "Identifier" },
	Keys: { pattern: "keys", longer_alt: "Identifier" },

	UI: { pattern: "ui", longer_alt: "Identifier" },
	Pos: { pattern: "pos", longer_alt: "Identifier" },
	Width: { pattern: "width", longer_alt: "Identifier" },
	Height: { pattern: "height", longer_alt: "Identifier" },
	Fill: { pattern: "fill", longer_alt: "Identifier" },
	Pad: { pattern: "pad", longer_alt: "Identifier" },
	Type: { pattern: "type", longer_alt: "Identifier" },

	Left: { pattern: "left", longer_alt: "Identifier" },
	Right: { pattern: "right", longer_alt: "Identifier" },
	Center: { pattern: "center", longer_alt: "Identifier" },
	Top: { pattern: "top", longer_alt: "Identifier" },
	Bottom: { pattern: "bottom", longer_alt: "Identifier" },

	// Set: {  pattern: "set", longer_alt: "Identifier"},
	Def: { pattern: "def", longer_alt: "Identifier" },
	For: { pattern: "for", longer_alt: "Identifier" },
	Repeat: { pattern: "repeat", longer_alt: "Identifier" },
	Index: { pattern: "index", longer_alt: "Identifier" },
	Settings: { pattern: "settings", longer_alt: "Identifier" },

	MS: { pattern: "ms", longer_alt: "Identifier" },
	On: { pattern: "on", longer_alt: "Identifier" },
	Of: { pattern: "of", longer_alt: "Identifier" },

	True: { pattern: "true", longer_alt: "Identifier" },
	False: { pattern: "false", longer_alt: "Identifier" },

	StringLiteral: { pattern: matchStringLiteral, line_breaks: false },

	AdditionOp: { pattern: Lexer.NA },
	Plus: { pattern: "+", categories: "AdditionOp" },
	Minus: { pattern: "-", categories: "AdditionOp" },

	MultiplicationOp: { pattern: Lexer.NA },
	Multiply: { pattern: "*", categories: "MultiplicationOp" },
	Divide: { pattern: "/", categories: "MultiplicationOp" },

	Comma: { pattern: "," },
	Dot: { pattern: "." },
	Dollar: { pattern: "$" },
	Colon: { pattern: ":" },
	Equal: { pattern: "=" },
	OpenParent: { pattern: "(" },
	CloseParent: { pattern: ")" },
	OpenCurly: { pattern: "{" },
	CloseCurly: { pattern: "}" },
	OpenBracket: { pattern: "[" },
	CloseBracket: { pattern: "]" },
	Integer: { pattern: /0|[1-9]\d*/ },
	HexNumber: { pattern: /#(?:[0-9A-Fa-f]{1,8})/ },

	WhiteSpace: { pattern: /\s+/, group: Lexer.SKIPPED },
	Comment: { pattern: /\/\/[^\n\r]*/, group: Lexer.SKIPPED },
};

export const tokens: Record<string, ITokenConfig> = {};
for (const [key, value] of Object.entries(tokenDefs)) {
	if (value.longer_alt) {
		value.longer_alt = tokens[value.longer_alt as string];
	}
	if (value.categories) {
		value.categories = tokens[value.categories as string];
	}
	tokens[key] = createToken({ ...value, name: key } as ITokenConfig);
}

// The order of tokens is important
export const tokenList = [
	tokens.WhiteSpace,
	tokens.Comment,

	// "keywords" appear before the Identifier
	tokens.Display,
	tokens.Game,
	tokens.Level,
	tokens.Debug,
	tokens.Editor,
	tokens.Entities,
	tokens.Globals,

	tokens.Background,
	tokens.ShowCursor,
	tokens.On,
	tokens.Of,

	tokens.True,
	tokens.False,

	tokens.Timer,
	tokens.MS,
	tokens.Font,
	tokens.Layout,
	tokens.Layer,
	tokens.Align,
	tokens.VAlign,
	tokens.Size,
	tokens.Zoom,
	tokens.Color,
	tokens.Var,
	tokens.At,
	tokens.Dir,
	tokens.Range,
	tokens.Action,
	tokens.Anim,
	tokens.Path,
	tokens.Speed,
	tokens.ID,
	tokens.Count,
	tokens.Spawn,

	tokens.Text,
	tokens.Sprite,
	tokens.Pool,
	tokens.Traits,
	tokens.Trait,
	tokens.Image,

	tokens.Menu,
	tokens.Items,
	tokens.Item,
	tokens.Selection,
	tokens.Keys,

	tokens.UI,
	tokens.Pos,
	tokens.View,
	tokens.Rect,
	tokens.Width,
	tokens.Height,
	tokens.Fill,
	tokens.Pad,
	tokens.Type,
	tokens.Sound,
	tokens.Play,
	tokens.Loop,

	tokens.Left,
	tokens.Right,
	tokens.Center,
	tokens.Top,
	tokens.Bottom,

	// tokens.Set,
	tokens.Def,
	tokens.For,
	tokens.Repeat,
	tokens.Index,
	tokens.Settings,

	// The Identifier must appear after the keywords because all keywords are valid identifiers.
	tokens.Identifier,
	tokens.Variable,
	tokens.Comma,
	tokens.Dot,
	tokens.Dollar,
	tokens.Colon,
	tokens.Equal,
	tokens.OpenCurly,
	tokens.CloseCurly,
	tokens.OpenBracket,
	tokens.CloseBracket,
	tokens.OpenParent,
	tokens.CloseParent,

	tokens.HexNumber,
	tokens.Integer,
	tokens.StringLiteral,

	tokens.Plus,
	tokens.Minus,
	tokens.Multiply,
	tokens.Divide,
	tokens.AdditionOp,
	tokens.MultiplicationOp,
];

export const SheetLexer = new Lexer(tokenList);

// export function lex(inputText) {
//   const lexingResult = SheetLexer.tokenize(inputText);

//   if (lexingResult.errors.length > 0) {
// 	console.error("LEXERR", lexingResult.errors);
//     throw Error("Sad Sad Panda, lexing errors detected");
//   }

//   return lexingResult;
// }
