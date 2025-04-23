import type GameContext from "../game/GameContext";
import { compileScript } from "../script/compiler/compiler";
import type { SceneDisplaySheet } from "../script/compiler/display/display.rules";
import type { TSceneLevelSheet } from "../script/compiler/level/level.rules";
import LocalDB from "../utils/storage.util";
import type { Scene } from "./Scene";
import { DisplayScene } from "./display.scene";
// import EditorScene from "./editor.scene.js";
import { GameScene } from "./game.scene";
import LevelScene from "./level.scene";

export type SceneGameSheet = {
	type: "game";
	name: string;
};
export type SceneSheet = SceneDisplaySheet | TSceneLevelSheet | SceneGameSheet;

const GLOBAL_VARIABLES = new Map([
	// display
	["highscores", 0],
	["player", 0],
	["mouseX", 0],
	["mouseY", 0],
	["sprites", 0],
	["clientHeight", 0],
	["clientWidth", 0],
	["centerX", 0],
	["centerY", 0],
	["centerUIY", 0],
	//menu
	["itemSelected", 0],
	["itemIdxSelected", 0],
	// debug
	["frameSpriteSize", 0],
	["frameSprite", 0],
	["spriteType", 0],
	["anim", 0],
	["spriteIndex", 0],
]);

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class SceneFactory {
	static async load(gc: GameContext, name: string) {
		let sheet: SceneSheet | null = null;

		// console.log(`SceneFactory.load "${name}"`);

		gc.wannaPauseOnBlur = true;

		sheet = LocalDB.loadResource(name);
		if (!sheet) {
			try {
				const scriptText = await gc.resourceManager.loadScene(name);
				sheet = compileScript(scriptText, GLOBAL_VARIABLES);
			} catch (e) {
				console.error((e as Error).message);
			}
		}

		// console.log("SceneFactory.load", JSON.stringify(sheet, undefined, 2), sheet);

		if (!sheet) throw new Error(`Uknown Scene: ${name}`);

		let scene: Scene;
		switch (sheet.type) {
			case "display":
				scene = new DisplayScene(gc, sheet);
				break;
			// case "editor":
			// 	scene= new EditorScene(gc, sheet.name, sheet);
			// 	break;
			case "level":
				scene = new LevelScene(gc, sheet);
				break;
			case "game":
				scene = new GameScene(gc, sheet);
				break;
			default:
				// throw new Error(`Uknown Scene type: ${sheet.type}`);
				throw new Error("Uknown Scene type");
		}

		// scene.killOnExit= sheet.killOnExit ? true : false;
		if ("showCursor" in sheet) gc.viewport.canvas.style.cursor = sheet.showCursor ? "default" : "none";

		return scene;
	}
}
