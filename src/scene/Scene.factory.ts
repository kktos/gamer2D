import type GameContext from "../game/types/GameContext";
import type { SceneConstructor } from "../game/types/GameOptions";
import { compileScript } from "../script/compiler/compiler";
import type { TSceneSheet } from "../script/compiler/scenes/scene.rules";
import LocalDB from "../utils/storage.util";
import type { TVarDict, TVarTypes } from "../utils/vars.utils";
import type { Scene } from "./Scene";
import { DisplayScene } from "./display.scene";

export const GLOBAL_VARIABLES: TVarDict = new Map<string, TVarTypes>([
	// display
	// ["highscores", 0],
	// ["player", 0],
	["mouseX", 0],
	["mouseY", 0],
	// ["sprites", 0],
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

const sceneClasses: Record<TSceneSheet["type"], SceneConstructor | null> = {
	display: DisplayScene,
	level: null,
	game: null,
};

export function setupScene(sceneType: TSceneSheet["type"], sceneClass: SceneConstructor) {
	if (!sceneClasses[sceneType]) sceneClasses[sceneType] = sceneClass;
}

export function createScene(gc: GameContext, className: string, ...args: unknown[]): Scene {
	if (!sceneClasses[className]) {
		throw new TypeError(`Unknown Scene Type ${className}`);
	}
	return new sceneClasses[className](gc, ...args);
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class SceneFactory {
	static async load(gc: GameContext, name: string) {
		let sheet: TSceneSheet | null = null;

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

		if (!sheet) throw new Error(`Unknown Scene: ${name}`);

		let scene: Scene;
		switch (sheet.type) {
			case "display":
			case "level":
			case "game":
				scene = createScene(gc, sheet.type, sheet);
				break;
			default:
				throw new Error("Unknown Scene type");
		}

		// scene.killOnExit= sheet.killOnExit ? true : false;
		if ("showCursor" in sheet) gc.viewport.canvas.style.cursor = sheet.showCursor ? "default" : "none";

		return scene;
	}
}
