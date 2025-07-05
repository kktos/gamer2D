import type { GameContext } from "../game/types/GameContext";
import type { SceneConstructor } from "../game/types/GameOptions";
import { loadLayer } from "../layers/Layer.factory";
import { compile } from "../script/compiler2/compiler";
import type { TNeatSettingsCommand, TNeatVariablesCommand } from "../script/compiler2/types/commands.type";
import type { TNeatLayerLoad } from "../script/compiler2/types/layers.type";
import type { TNeatScene } from "../script/compiler2/types/scenes.type";
import { loadJson } from "../utils/loaders.util";
import { LocalDB } from "../utils/storage.util";
import { DisplayScene } from "./display.scene";
import type { Scene } from "./Scene";

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
			if (layerDef.type === "*") sheet.layers[idx] = await loadLayer(gc, String(layerDef.path));
			const layer = sheet.layers[idx];
			if (layer.load?.length) {
				for await (const blockDef of layer.load) {
					const block = await loadBlock(blockDef);
					if (!layer.data) layer.data = [];
					layer.data.unshift(block);
				}
			}
		}

		if (!["display", "level", "game"].includes(sheet.type)) throw new Error(`Unknown Scene type: ${sheet.type}`);

		const scene = createScene(gc, sheet.type, filename, sheet);

		// scene.killOnExit= sheet.killOnExit ? true : false;
		if ("showCursor" in sheet) gc.viewport.canvas.style.cursor = sheet.showCursor ? "default" : "none";

		return scene;
	}
}

async function loadBlock(block: TNeatLayerLoad) {
	let result: TNeatSettingsCommand | TNeatVariablesCommand;
	const content = await loadJson(block.path);
	switch (block.type) {
		case "variables":
			result = { cmd: "VARIABLES", value: content };
			break;
		case "settings":
			result = { cmd: "SETTINGS", value: content };
			break;
	}
	return result;
}
