import "./index.css";
import type { TFontSheet } from "gamer2d/game/Font";
import { Game } from "gamer2d/game/Game";
import { addEntity } from "gamer2d/game/GameHelpers";
import type { GameOptions } from "gamer2d/game/types/GameOptions";
import { CompileSyntaxErr } from "gamer2d/script/compiler/compiler";
import { ZenChanEntity } from "./entities/zen-chan.entity.js";

const settings = `
	FPS = 60

	FONT.MAIN = bubble-bobble

	VIEWPORT.WIDTH = 600
	VIEWPORT.HEIGHT = 600
	VIEWPORT.RATIO = 1.066666
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

const fontBB: TFontSheet = {
	name: "bubble-bobble",
	height: 8,
	width: 8,
	charset: " !\"#$%&'()*+,-./0123456789:;<=>?©ABCDEFGHIJKLMNOPQRSTUVWXYZ[]",
	img: "images/font-bubble-bobble.png",
	offsetX: 1,
	offsetY: 1,
	gapX: 1,
	gapY: 2,
	hasLowercase: false,
};
const font: TFontSheet = {
	name: "cellphone",
	// name: "bubble-bobble",
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
// const resources: TResourceGroupsDict = {
// 	spritesheets: ["bobblun.script", "zen-chan.script", "level-tiles.script"],
// 	fonts: [font, fontBB],
// };

try {
	const canvas = document.querySelector<HTMLCanvasElement>("CANVAS");
	if (!canvas) throw new Error("No Canvas game element found !?!");

	addEntity("zen-chan", ZenChanEntity);

	const game = new Game(canvas, options);

	game
		.load("resources.json")
		.then(() => {
			game.start("test");
		})
		.catch((e) => {
			if (e instanceof CompileSyntaxErr) {
				console.log(`Script syntax in "${e.filename}" at line ${e.line} "${e.word}" rule:${e.ruleStack}`);
			} else console.error("BOOM 1", e);
		});
} catch (err) {
	if (err instanceof SyntaxError) {
		console.log("BOOM 2", err.cause);
	} else console.error("GAME ERROR", err);
}
