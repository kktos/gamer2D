import type { GameContext } from "../game/types/GameContext";
import type { SceneConstructor } from "../game/types/GameOptions";
import { loadLayer } from "../layers/Layer.factory";
import { compile } from "../script/compiler2/compiler";
import type { TNeatScene } from "../script/compiler2/types/scenes.type";
import { LocalDB } from "../utils/storage.util";
import type { Scene } from "./Scene";
import { DisplayScene } from "./display.scene";

const sceneClasses: Record<string, SceneConstructor | null> = {
	display: DisplayScene,
	level: null,
	game: null,
};

export function setupScene(sceneType: string, sceneClass: SceneConstructor) {
	if (!sceneClasses[sceneType]) sceneClasses[sceneType] = sceneClass;
}

export function createScene(gc: GameContext, className: string, ...args: unknown[]): Scene {
	if (!sceneClasses[className]) {
		throw new TypeError(`Unknown Scene Type ${className}`);
	}
	return new sceneClasses[className](gc, ...args);
}

// biome-ignore lint/complexity/noStaticOnlyClass: I want this
export class SceneFactory {
	static async load(gc: GameContext, filename: string) {
		let sheet: TNeatScene | null = null;

		// console.log(`SceneFactory.load "${name}"`);

		gc.wannaPauseOnBlur = true;

		sheet = LocalDB.loadResource(filename);
		if (!sheet) {
			try {
				const scriptText = await gc.resourceManager.loadScene(filename);
				sheet = compile<TNeatScene>(scriptText, "scene");
			} catch (e) {
				// if (e instanceof CompileSyntaxErr) {
				// 	console.error(`SYNTAX ERROR\nline ${e.line} at ${e.word} rule: ${e.ruleStack}\n${e.message}`);
				// } else console.error((e as Error).message);
				console.error((e as Error).message);
			}
		}

		// console.log("SceneFactory.load", JSON.stringify(sheet, undefined, 2), sheet);

		if (!sheet) throw new Error(`Unknown Scene: ${filename}`);

		let idx = -1;
		for await (const layerDef of sheet.layers) {
			idx++;
			if (layerDef.type !== "*") continue;
			sheet.layers[idx] = await loadLayer(gc, String(layerDef.path));
		}

		if (!["display", "level", "game"].includes(sheet.type)) throw new Error(`Unknown Scene type: ${sheet.type}`);

		const scene = createScene(gc, sheet.type, filename, sheet);

		// scene.killOnExit= sheet.killOnExit ? true : false;
		if ("showCursor" in sheet) gc.viewport.canvas.style.cursor = sheet.showCursor ? "default" : "none";

		return scene;
	}
}
