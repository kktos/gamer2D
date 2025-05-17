import { Game } from "gamer2d/game/Game";
import type { TResourceGroupsDict } from "gamer2d/game/ResourceManager";
import type { GameOptions } from "gamer2d/game/types/GameOptions";
import "./index.css";
import type { TFontSheet } from "gamer2d/game/Font";
import { addView } from "gamer2d/game/GameHelpers";
import { SpritesheetEditorView } from "./spritesheet-editor/editor/spritesheet-editor.view.js";
import { SpritesheetViewerView } from "./spritesheet-editor/viewer/spritesheet-viewer.view.js";

const settings = `
	FPS = 60

	FONT.MAIN = bubble-bobble

	VIEWPORT.WIDTH = 600
	VIEWPORT.HEIGHT = 600
	VIEWPORT.RATIO = 1.23
	UI.HEIGHT = 200
	
	MENU.COLORS.SELECT_RECT = #A5A5A5
	MENU.COLORS.SELECTED_TEXT = #ffff07

	LEVEL_GRID.X = 20
	LEVEL_GRID.Y = 55

	PHYSICS.GRAVITY = 10

	AUDIO.VOLUME = 50

	LOGS = 
`;

const options: GameOptions = {
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

const fontBB = {
	name: "bubble-bobble",
	height: 8,
	width: 8,
	charset: " !\"#$%&'()*+,-./0123456789:;<=>?©ABCDEFGHIJKLMNOPQRSTUVWXYZ[]",
	img: "images/font-bubble-bobble.png",
	offsetX: 1,
	offsetY: 1,
	gapX: 1,
};
const font: TFontSheet = {
	// name: "cellphone",
	name: "bubble-bobble",
	height: 7,
	width: 6,
	charset: " !\"#$%&'()*+,-./0123456789:;<=>?©ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~",
	img: "images/font-cellphone.png",
	offsetX: 1,
	offsetY: 1,
	gapX: 1,
	gapY: 2,
	hasLowercase: true,
};
const resources: TResourceGroupsDict = {
	spritesheets: ["bobblun.script"],
	fonts: [font],
};

try {
	const canvas = document.querySelector<HTMLCanvasElement>("#game CANVAS");
	if (!canvas) throw new Error("No Canvas game element found !?!");

	const game = new Game(canvas, options);

	addView("editor", SpritesheetEditorView);
	addView("viewer", SpritesheetViewerView);

	game.start("editor", resources);
} catch (err) {
	console.error("GAME ERROR", err);
}
