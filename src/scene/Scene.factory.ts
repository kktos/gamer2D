import type GameContext from "../game/GameContext";
import { compileScript } from "../script/compiler/compiler";
import type { TEventHandlers } from "../script/compiler/display/on.rules";
import type { TSoundDefs } from "../script/compiler/display/sound.rules";
import LocalDB from "../utils/storage.util";
import type { Scene } from "./Scene";
import { DisplayScene } from "./display.scene";
// import DebugScene from "./debug.scene.js";
// import EditorScene from "./editor.scene.js";
import { GameScene } from "./game.scene";
import LevelScene from "./level.scene";

export type SceneSheet = {
	name: string;
	type: string;
	showCursor: boolean;
	background: string;
	layers: string[];
	ui: unknown;
	font: string;
	layout: unknown[];
	sounds: TSoundDefs;
	on: TEventHandlers;
};

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class SceneFactory {
	static async load(gc: GameContext, name: string) {
		let sheet: SceneSheet | null = null;

		// console.log(`SceneFactory.load "${name}"`);

		gc.wannaPauseOnBlur = true;

		sheet = LocalDB.loadResource(name);
		if (!sheet) {
			try {
				// const scriptText = await loadText(`${ENV.SCENES_PATH}${name}.script`);
				const scriptText = await gc.resourceManager.loadScene(name);
				sheet = compileScript(scriptText);
			} catch (e) {
				console.error((e as Error).message);
				// sheet = await loadJson(`${ENV.SCENES_PATH}${name}.json`);
			}
		}

		// console.log("SceneFactory.load", JSON.stringify(sheet, undefined, 2), sheet);

		if (!sheet) throw new Error(`Uknown Scene: ${name}`);

		let scene: Scene;
		switch (sheet.type) {
			case "display":
				scene = new DisplayScene(gc, sheet.name, sheet);
				break;
			// case "debug":
			// 	scene= new DebugScene(gc, sheet.name, sheet);
			// 	break;
			// case "editor":
			// 	scene= new EditorScene(gc, sheet.name, sheet);
			// 	break;
			case "level":
				scene = new LevelScene(gc, sheet.name, sheet);
				break;
			case "game":
				scene = new GameScene(gc, sheet.name, sheet);
				break;
			default:
				throw new Error(`Uknown Scene type: ${sheet.type}`);
		}

		// scene.killOnExit= sheet.killOnExit ? true : false;
		gc.viewport.canvas.style.cursor = sheet.showCursor ? "default" : "none";

		return scene;
	}
}
