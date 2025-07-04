import type { NeatParser } from "../parser";
import type { TNeatScene } from "../types/scenes.type";

export function parseScene(parser: NeatParser): TNeatScene {
	const sceneType = parser.consume("IDENTIFIER").value;
	const sceneName = parser.consume("STRING").value;
	const data = parser.invokeRule<Partial<TNeatScene>>(`scene_${sceneType}`);
	const result: Partial<TNeatScene> = { type: sceneType, name: sceneName, ...data };
	return result as TNeatScene;
}
