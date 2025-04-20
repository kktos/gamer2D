import type GameContext from "../game/GameContext";
import { compileScript } from "../script/compiler/compiler";
import LocalDB from "../utils/storage.util";
import type { Scene } from "./Scene";
import { DisplayScene, type SceneDisplaySheet } from "./display.scene";
// import EditorScene from "./editor.scene.js";
import { GameScene } from "./game.scene";
import LevelScene, { type SceneLevelSheet } from "./level.scene";

export type SceneGameSheet = {
	type: "game";
	name: string;
};
export type SceneSheet = SceneDisplaySheet | SceneLevelSheet | SceneGameSheet;

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
				sheet = compileScript(scriptText);
			} catch (e) {
				console.error((e as Error).message);
			}
		}

		// console.log("SceneFactory.load", JSON.stringify(sheet, undefined, 2), sheet);

		if (!sheet) throw new Error(`Uknown Scene: ${name}`);

		let scene: Scene;
		switch (sheet.type) {
			case "display":
				scene = new DisplayScene(gc, sheet.name, sheet);
				break;
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
				// throw new Error(`Uknown Scene type: ${sheet.type}`);
				throw new Error("Uknown Scene type");
		}

		// scene.killOnExit= sheet.killOnExit ? true : false;
		if ("showCursor" in sheet) gc.viewport.canvas.style.cursor = sheet.showCursor ? "default" : "none";

		return scene;
	}
}
