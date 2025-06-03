import { GLOBAL_VARIABLES } from "../game/globals";
import type { GameContext } from "../game/types/GameContext";
import type { SceneConstructor } from "../game/types/GameOptions";
import { loadLayer } from "../layers/Layer.factory";
import { CompileSyntaxErr, compileScript } from "../script/compiler/compiler";
import type { TSceneSheet } from "../script/compiler/scenes/scene.rules";
import { LocalDB } from "../utils/storage.util";
import type { Scene } from "./Scene";
import { DisplayScene } from "./display.scene";

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
	static async load(gc: GameContext, filename: string) {
		let sheet: TSceneSheet | null = null;

		// console.log(`SceneFactory.load "${name}"`);

		gc.wannaPauseOnBlur = true;

		sheet = LocalDB.loadResource(filename);
		if (!sheet) {
			try {
				const scriptText = await gc.resourceManager.loadScene(filename);
				sheet = compileScript(scriptText, GLOBAL_VARIABLES);
			} catch (e) {
				if (e instanceof CompileSyntaxErr) {
					console.error(`SYNTAX ERROR\nline ${e.line} at ${e.word} rule: ${e.ruleStack}\n${e.message}`);
					// throw e;
				} else console.error((e as Error).message);
			}
		}

		// console.log("SceneFactory.load", JSON.stringify(sheet, undefined, 2), sheet);

		if (!sheet) throw new Error(`Unknown Scene: ${filename}`);

		let idx = -1;
		for await (const layerDef of sheet.layers) {
			idx++;
			if (layerDef.type !== "*") continue;
			sheet.layers[idx] = await loadLayer(gc, String(layerDef.name));
		}

		let scene: Scene;
		switch (sheet.type) {
			case "display":
			case "level":
			case "game":
				scene = createScene(gc, sheet.type, filename, sheet);
				break;
			default:
				throw new Error("Unknown Scene type");
		}

		// scene.killOnExit= sheet.killOnExit ? true : false;
		if ("showCursor" in sheet) gc.viewport.canvas.style.cursor = sheet.showCursor ? "default" : "none";

		return scene;
	}
}
