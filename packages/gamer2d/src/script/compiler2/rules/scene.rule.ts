import type { NeatParser } from "../parser";
import type { TNeatScene } from "../types/scenes.type";

export function parseScene(parser: NeatParser) {
	const sceneType = parser.consume("IDENTIFIER").value;
	const sceneName = parser.consume("STRING").value;
	const data = parser.invokeRule<TNeatScene>(`scene_${sceneType}`);
	return { type: sceneType, name: sceneName, ...data };
}
