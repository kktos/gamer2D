import "./index.css";

import { Game, addEntity } from "gamer2d";
import { evalExpression } from "gamer2d/script/engine2/expr.eval";
import { compile } from "../../../packages/gamer2d/src/script/compiler2/compiler";
import { runCommands } from "../../../packages/gamer2d/src/script/engine2/exec";
import { BubbleEntity } from "./entities/bubble.entity.js";
import { BubblunEntity } from "./entities/bubblun.entity.js";
import { ZenChanEntity } from "./entities/zen-chan.entity.js";

const SCRIPT = "intro";

const settings = `
	FPS = 60

	FONT.MAIN = bubble-bobble

	VIEWPORT.WIDTH = 600
	VIEWPORT.HEIGHT = 600
	VIEWPORT.RATIO = 1
	VIEWPORT.RATIO_OLD = 1.066666
	UI.HEIGHT = 200
	
	MENU.COLORS.SELECT_RECT = #A5A5A5
	MENU.COLORS.SELECTED_TEXT = #ffff07

	LEVEL_GRID.X = 20
	LEVEL_GRID.Y = 55

	PHYSICS.GRAVITY = 10

	AUDIO.VOLUME = 50

	LOGS = 
`;

const options = {
	paths: {
		audiosheets: "sounds",
		fonts: "fonts",
		spritesheets: "spritesheets",
		scenes: "scenes",
		levels: "levels",
	},
	settings,
	isDebugEnabled: true,
};

// const font: TFontSheet = {
// 	name: "cellphone",
// 	height: 7,
// 	width: 6,
// 	charset: " !\"#$%&'()*+,-./0123456789:;<=>?©ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~",
// 	img: "images/font-cellphone.png",
// 	offsetX: 1,
// 	offsetY: 1,
// 	gapX: 1,
// 	gapY: 2,
// 	hasLowercase: true,
// };

let game: Game | null = null;

// Uncomment and modify when ready to initialize the game
function startGame() {
	try {
		const canvas = document.querySelector<HTMLCanvasElement>("#game");
		if (!canvas) throw new Error("No Canvas game element found !?!");

		addEntity("zen-chan", ZenChanEntity);
		addEntity("BubbleEntity", BubbleEntity);
		addEntity("BubblunEntity", BubblunEntity);

		game = new Game(canvas, options);
		game.load("resources.json").then(() => {
			game?.start(SCRIPT);
		});

		// .catch((e) => {
		// 	if (e instanceof CompileSyntaxErr) {
		// 		console.log(`Script syntax in "${e.filename}" at line ${e.line} "${e.word}" rule:${e.ruleStack}`);
		// 	} else console.error("BOOM 1", e);
		// });
	} catch (err) {
		if (err instanceof SyntaxError) {
			console.log("BOOM 2", err.cause);
		} else console.error("GAME ERROR", err);
	}
}

function loadGame() {
	// const canvas = document.querySelector<HTMLCanvasElement>("#game");
	// if (!canvas) throw new Error("No Canvas game element found !?!");
	// // addEntity("zen-chan", ZenChanEntity);
	// game = new Game(canvas, options);
	// game.load("resources.json");
}

async function loadText(url: string) {
	const query = await fetch(url);
	return await query.text();
}

document.addEventListener("DOMContentLoaded", async () => {
	// Script Editor elements
	const scriptInput = document.getElementById("scriptInput") as HTMLTextAreaElement;
	const parseSceneButton = document.getElementById("parseSceneButton");
	const parseLayerButton = document.getElementById("parseLayerButton");
	const loadButton = document.getElementById("loadButton");
	const outputTokens = document.getElementById("outputTokens");

	// Expression Evaluator elements
	const jsonInput = document.getElementById("jsonInput") as HTMLTextAreaElement;
	const evalButton = document.getElementById("evalButton") as HTMLButtonElement;
	const evalOutput = document.getElementById("evalOutput") as HTMLPreElement;
	const resultOutput = document.getElementById("resultOutput") as HTMLPreElement;
	const expressionInput = document.getElementById("expressionInput") as HTMLInputElement;

	const startGameButton = document.getElementById("startGameButton") as HTMLButtonElement;
	// Check if all required elements exist
	if (!startGameButton || !scriptInput || !parseSceneButton || !parseLayerButton || !loadButton || !outputTokens || !jsonInput || !evalButton || !evalOutput) {
		console.error("One or more required HTML elements are missing.");
		return;
	}

	loadGame();

	startGameButton.addEventListener("click", async () => {
		try {
			startGame();
		} catch (error) {
			console.error("Error loading script:", error);
			scriptInput.value = "// Error loading script file";
		}
	});

	loadButton.addEventListener("click", async () => {
		try {
			scriptInput.value = await loadText("scenes/test-new.script");
		} catch (error) {
			console.error("Error loading script:", error);
			scriptInput.value = "// Error loading script file";
		}
	});

	parseSceneButton.addEventListener("click", async () => {
		const scriptContent = scriptInput.value;

		try {
			const tokens = compile(scriptContent, "scene");
			outputTokens.textContent = JSON.stringify(tokens, null, 2);
		} catch (error) {
			outputTokens.innerHTML = `<span style="color: red">Error parsing script: ${(error as Error).message}</span>`;
			console.error("Parse scene error:", error);
		}
	});

	parseLayerButton.addEventListener("click", async () => {
		try {
			const tokens = compile(scriptInput.value, "layer");
			outputTokens.textContent = JSON.stringify(tokens, null, 2);
		} catch (error) {
			outputTokens.innerHTML = `<span style="color: red">Error parsing script: ${(error as Error).message}</span>`;
			console.error("Parse layer error:", error);
		}
	});

	// Expression Evaluator Event Listeners
	evalButton.addEventListener("click", () => {
		const jsonString = `{${jsonInput.value}}`;
		let astVars: { [key: string]: unknown } = {};
		let astExpr: { [key: string]: unknown } = {};
		try {
			astVars = compile(jsonString, "statements");
			evalOutput.textContent = `Variables: ${JSON.stringify(astVars, null, 2)}\n`;

			astExpr = compile(expressionInput.value, "expression");
			evalOutput.textContent += `Expression: ${JSON.stringify(astExpr, null, 2)}`;
		} catch (error) {
			evalOutput.innerHTML = `<span style="color: red">Error evaluating: ${(error as Error).message}</span>`;
			console.error("Evaluation error:", error);
			return;
		}
		try {
			const context = {
				variables: new Map(),
				//functions:
			};
			runCommands(astVars, context);
			resultOutput.textContent = `Result: ${evalExpression(astExpr, context)}`;
		} catch (error) {
			resultOutput.innerHTML = `<span style="color: red">Error evaluating: ${(error as Error).message}</span>`;
			console.error("Evaluation error:", error);
			return;
		}
	});

	// Load default script (fallback if file doesn't exist)
	try {
		scriptInput.value = await loadText(`scenes/${SCRIPT}.script`);
	} catch (error) {
		console.warn("Could not load default script file:", error);
		scriptInput.value = "// Default script file not found\n// Enter your script here...";
	}
});
